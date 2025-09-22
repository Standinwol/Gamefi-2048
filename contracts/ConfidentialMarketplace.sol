// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

// Interface for the confidential NFT contract
interface IConfidentialGameNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// Interface for the confidential token contract
interface IConfidentialGameToken {
    function transferFrom(address from, address to, bytes calldata encryptedAmount) external returns (bool);
    function balanceOf(address account) external view returns (euint64);
}

/**
 * @title ConfidentialMarketplace
 * @dev A confidential marketplace for trading NFTs with encrypted prices
 * All pricing information is kept private using FHEVM
 */
contract ConfidentialMarketplace is GatewayCaller {
    using TFHE for euint64;
    
    struct ConfidentialListing {
        address seller;
        uint256 tokenId;
        euint64 price;           // Encrypted price
        euint64 timestamp;       // Encrypted listing timestamp
        bool active;
    }
    
    IConfidentialGameNFT public nftContract;
    IConfidentialGameToken public tokenContract;
    
    mapping(uint256 => ConfidentialListing) public listings;
    mapping(address => uint256[]) private sellerListings;
    uint256[] public allListings;
    
    // Platform fee (5% encrypted)
    euint64 public platformFee;
    address public owner;
    
    // Events
    event ItemListed(address indexed seller, uint256 indexed tokenId, euint64 encryptedPrice);
    event ItemSold(address indexed buyer, address indexed seller, uint256 indexed tokenId, euint64 encryptedPrice);
    event ItemWithdrawn(address indexed seller, uint256 indexed tokenId);
    event PriceUpdated(uint256 indexed tokenId, euint64 newEncryptedPrice);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyTokenOwner(uint256 tokenId) {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the token owner");
        _;
    }
    
    modifier listingExists(uint256 tokenId) {
        require(listings[tokenId].active, "Listing doesn't exist");
        _;
    }
    
    constructor(address _nftContract, address _tokenContract) {
        owner = msg.sender;
        nftContract = IConfidentialGameNFT(_nftContract);
        tokenContract = IConfidentialGameToken(_tokenContract);
        // Set platform fee to 5% (encrypted)
        platformFee = TFHE.asEuint64(5);
    }
    
    /**
     * @dev List an NFT for sale with encrypted price
     */
    function listItem(uint256 tokenId, bytes calldata encryptedPrice) external onlyTokenOwner(tokenId) {
        require(!listings[tokenId].active, "Item already listed");
        require(
            nftContract.getApproved(tokenId) == address(this) || 
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        
        euint64 price = TFHE.asEuint64(encryptedPrice);
        euint64 timestamp = TFHE.asEuint64(block.timestamp);
        
        listings[tokenId] = ConfidentialListing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            timestamp: timestamp,
            active: true
        });
        
        sellerListings[msg.sender].push(tokenId);
        allListings.push(tokenId);
        
        emit ItemListed(msg.sender, tokenId, price);
    }
    
    /**
     * @dev Buy an NFT with encrypted payment verification
     */
    function buyItem(uint256 tokenId, bytes calldata encryptedPayment) external listingExists(tokenId) {
        ConfidentialListing storage listing = listings[tokenId];
        require(listing.seller != msg.sender, "Cannot buy your own item");
        
        euint64 payment = TFHE.asEuint64(encryptedPayment);
        
        // Verify payment matches the price (encrypted comparison)
        ebool validPayment = TFHE.ge(payment, listing.price);
        require(TFHE.decrypt(validPayment), "Insufficient payment");
        
        address seller = listing.seller;
        euint64 salePrice = listing.price;
        
        // Calculate platform fee (5%)
        euint64 fee = TFHE.div(TFHE.mul(salePrice, platformFee), TFHE.asEuint64(100));
        euint64 sellerAmount = TFHE.sub(salePrice, fee);
        
        // Transfer payment from buyer to seller
        bytes memory sellerPaymentBytes = abi.encode(TFHE.decrypt(sellerAmount));
        require(
            tokenContract.transferFrom(msg.sender, seller, sellerPaymentBytes),
            "Payment to seller failed"
        );
        
        // Transfer platform fee to owner
        bytes memory feeBytes = abi.encode(TFHE.decrypt(fee));
        require(
            tokenContract.transferFrom(msg.sender, owner, feeBytes),
            "Platform fee transfer failed"
        );
        
        // Transfer NFT to buyer
        nftContract.transferFrom(seller, msg.sender, tokenId);
        
        // Remove listing
        _removeListing(tokenId, seller);
        
        emit ItemSold(msg.sender, seller, tokenId, salePrice);
    }
    
    /**
     * @dev Withdraw an NFT from sale
     */
    function withdrawItem(uint256 tokenId) external listingExists(tokenId) {
        ConfidentialListing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        
        _removeListing(tokenId, msg.sender);
        
        emit ItemWithdrawn(msg.sender, tokenId);
    }
    
    /**
     * @dev Update the price of a listed item
     */
    function updatePrice(uint256 tokenId, bytes calldata newEncryptedPrice) external listingExists(tokenId) {
        ConfidentialListing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        
        euint64 newPrice = TFHE.asEuint64(newEncryptedPrice);
        listing.price = newPrice;
        
        emit PriceUpdated(tokenId, newPrice);
    }
    
    /**
     * @dev Get all listed token IDs
     */
    function getAllListedNFTs() external view returns (uint256[] memory, address[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active) {
                activeCount++;
            }
        }
        
        uint256[] memory tokenIds = new uint256[](activeCount);
        address[] memory sellers = new address[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < allListings.length; i++) {
            uint256 tokenId = allListings[i];
            if (listings[tokenId].active) {
                tokenIds[index] = tokenId;
                sellers[index] = listings[tokenId].seller;
                index++;
            }
        }
        
        return (tokenIds, sellers);
    }
    
    /**
     * @dev Get user's active listings
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        uint256[] memory userTokens = sellerListings[user];
        uint256 activeCount = 0;
        
        // Count active listings for user
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (listings[userTokens[i]].active) {
                activeCount++;
            }
        }
        
        uint256[] memory activeTokens = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            uint256 tokenId = userTokens[i];
            if (listings[tokenId].active) {
                activeTokens[index] = tokenId;
                index++;
            }
        }
        
        return activeTokens;
    }
    
    /**
     * @dev Get listing details (only seller can see encrypted price)
     */
    function getListingDetails(uint256 tokenId) 
        external 
        view 
        listingExists(tokenId)
        returns (
            address seller,
            uint64 price,
            uint64 timestamp,
            bool canViewPrice
        ) 
    {
        ConfidentialListing memory listing = listings[tokenId];
        bool isSellerOrOwner = (msg.sender == listing.seller || msg.sender == owner);
        
        return (
            listing.seller,
            isSellerOrOwner ? TFHE.decrypt(listing.price) : 0,
            TFHE.decrypt(listing.timestamp),
            isSellerOrOwner
        );
    }
    
    /**
     * @dev Get public listing info (without encrypted price)
     */
    function getPublicListingInfo(uint256 tokenId) 
        external 
        view 
        listingExists(tokenId)
        returns (
            address seller,
            uint64 timestamp,
            bool isActive
        ) 
    {
        ConfidentialListing memory listing = listings[tokenId];
        
        return (
            listing.seller,
            TFHE.decrypt(listing.timestamp),
            listing.active
        );
    }
    
    /**
     * @dev Check if an item is listed
     */
    function isListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].active;
    }
    
    /**
     * @dev Internal function to remove a listing
     */
    function _removeListing(uint256 tokenId, address seller) internal {
        listings[tokenId].active = false;
        
        // Remove from seller's listings
        uint256[] storage userListings = sellerListings[seller];
        for (uint256 i = 0; i < userListings.length; i++) {
            if (userListings[i] == tokenId) {
                userListings[i] = userListings[userListings.length - 1];
                userListings.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(bytes calldata encryptedFee) external onlyOwner {
        platformFee = TFHE.asEuint64(encryptedFee);
    }
    
    /**
     * @dev Decrypt platform fee for owner
     */
    function decryptPlatformFee() external view onlyOwner returns (uint64) {
        return TFHE.decrypt(platformFee);
    }
    
    /**
     * @dev Emergency function to pause/unpause contract
     */
    bool public paused = false;
    
    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
}