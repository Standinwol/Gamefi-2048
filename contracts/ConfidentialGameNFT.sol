// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

// Game token contract interface
interface IConfidentialGameToken {
    function transferFrom(address from, address to, bytes calldata encryptedAmount) external returns (bool);
    function balanceOf(address account) external view returns (euint64);
}

/**
 * @title ConfidentialGameNFT
 * @dev A confidential ERC721-like NFT contract using FHEVM for the 2048 game
 * Game scores and achievement data are encrypted for privacy
 */
contract ConfidentialGameNFT is GatewayCaller {
    using TFHE for euint32;
    using TFHE for euint64;
    
    string public constant name = "Confidential 2048 Achievement NFT";
    string public constant symbol = "C2048";
    
    // NFT counter
    uint256 private _currentTokenId;
    
    // Token ownership
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Confidential game statistics
    struct ConfidentialGameStats {
        euint32 highestScore;      // Encrypted highest score
        address player;            // Player address (public)
        euint64 timestamp;         // Encrypted timestamp
        euint32 gamesPlayed;       // Encrypted number of games played
    }
    
    // NFT attributes with encrypted data
    struct ConfidentialNFTAttributes {
        ConfidentialGameStats stats;
        string rarity;             // Rarity level (derived from encrypted score)
        euint32 mintPrice;         // Encrypted mint price paid
    }
    
    mapping(uint256 => ConfidentialNFTAttributes) public tokenAttributes;
    mapping(address => uint256[]) private _userTokens;
    
    // Mint price in tokens (encrypted)
    euint64 public mintPrice;
    
    IConfidentialGameToken public gameToken;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event ConfidentialMint(address indexed to, uint256 indexed tokenId, euint32 encryptedScore);
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyOwnerOf(uint256 tokenId) {
        require(_owners[tokenId] == msg.sender, "Not the token owner");
        _;
    }
    
    constructor(address _gameToken) {
        owner = msg.sender;
        gameToken = IConfidentialGameToken(_gameToken);
        // Set mint price to 50 tokens (encrypted)
        mintPrice = TFHE.asEuint64(50 * 10**18);
        _currentTokenId = 1;
    }
    
    /**
     * @dev Mint NFT with encrypted game score
     */
    function mint(bytes calldata encryptedScore, bytes calldata encryptedTimestamp) public returns (uint256) {
        euint32 score = TFHE.asEuint32(encryptedScore);
        euint64 timestamp = TFHE.asEuint64(encryptedTimestamp);
        
        // Transfer mint price from user to contract
        bytes memory mintPriceBytes = abi.encode(TFHE.decrypt(mintPrice));
        require(
            gameToken.transferFrom(msg.sender, address(this), mintPriceBytes),
            "Payment failed"
        );
        
        uint256 tokenId = _currentTokenId;
        _currentTokenId++;
        
        // Mint the NFT
        _owners[tokenId] = msg.sender;
        _balances[msg.sender]++;
        _userTokens[msg.sender].push(tokenId);
        
        // Store encrypted attributes
        tokenAttributes[tokenId] = ConfidentialNFTAttributes({
            stats: ConfidentialGameStats({
                highestScore: score,
                player: msg.sender,
                timestamp: timestamp,
                gamesPlayed: TFHE.asEuint32(1)
            }),
            rarity: _calculateRarity(score),
            mintPrice: TFHE.asEuint32(TFHE.decrypt(mintPrice) / 10**18)
        });
        
        emit Transfer(address(0), msg.sender, tokenId);
        emit ConfidentialMint(msg.sender, tokenId, score);
        
        return tokenId;
    }
    
    /**
     * @dev Calculate rarity based on encrypted score
     * Note: This function reveals the rarity publicly but keeps the actual score private
     */
    function _calculateRarity(euint32 encryptedScore) internal view returns (string memory) {
        // Decrypt score only for rarity calculation
        // In a production environment, you might want to use threshold decryption
        uint32 score = TFHE.decrypt(encryptedScore);
        
        if (score >= 8192) return "Legendary";
        if (score >= 4096) return "Epic";
        if (score >= 2048) return "Rare";
        return "Common";
    }
    
    /**
     * @dev Get NFT details (only owner can see encrypted values)
     */
    function getNFTDetails(uint256 tokenId) 
        public 
        view 
        onlyOwnerOf(tokenId)
        returns (
            uint32 highestScore,
            address player,
            uint64 timestamp,
            string memory rarity,
            uint32 gamesPlayed
        ) 
    {
        ConfidentialNFTAttributes memory attrs = tokenAttributes[tokenId];
        
        return (
            TFHE.decrypt(attrs.stats.highestScore),
            attrs.stats.player,
            TFHE.decrypt(attrs.stats.timestamp),
            attrs.rarity,
            TFHE.decrypt(attrs.stats.gamesPlayed)
        );
    }
    
    /**
     * @dev Get public NFT info (rarity only, scores remain private)
     */
    function getPublicNFTInfo(uint256 tokenId) 
        public 
        view 
        returns (
            address player,
            string memory rarity
        ) 
    {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        ConfidentialNFTAttributes memory attrs = tokenAttributes[tokenId];
        
        return (
            attrs.stats.player,
            attrs.rarity
        );
    }
    
    /**
     * @dev Update game stats (for existing NFT holders)
     */
    function updateGameStats(uint256 tokenId, bytes calldata encryptedNewScore) 
        public 
        onlyOwnerOf(tokenId) 
    {
        euint32 newScore = TFHE.asEuint32(encryptedNewScore);
        ConfidentialNFTAttributes storage attrs = tokenAttributes[tokenId];
        
        // Only update if new score is higher
        ebool isHigher = TFHE.gt(newScore, attrs.stats.highestScore);
        attrs.stats.highestScore = TFHE.select(isHigher, newScore, attrs.stats.highestScore);
        attrs.stats.gamesPlayed = TFHE.add(attrs.stats.gamesPlayed, TFHE.asEuint32(1));
        
        // Update rarity if score improved
        if (TFHE.decrypt(isHigher)) {
            attrs.rarity = _calculateRarity(newScore);
        }
    }
    
    /**
     * @dev Standard ERC721 functions
     */
    function balanceOf(address tokenOwner) public view returns (uint256) {
        require(tokenOwner != address(0), "Zero address query");
        return _balances[tokenOwner];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token doesn't exist");
        return tokenOwner;
    }
    
    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "Approval to current owner");
        require(
            msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender],
            "Not owner nor approved for all"
        );
        
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        _safeTransfer(from, to, tokenId, data);
    }
    
    /**
     * @dev Internal transfer function
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Transfer from incorrect owner");
        require(to != address(0), "Transfer to zero address");
        
        // Clear approvals
        _tokenApprovals[tokenId] = address(0);
        
        // Update balances
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;
        
        // Update user token arrays
        _removeTokenFromUser(from, tokenId);
        _userTokens[to].push(tokenId);
        
        emit Transfer(from, to, tokenId);
    }
    
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "Transfer to non ERC721Receiver");
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        address tokenOwner = ownerOf(tokenId);
        return (spender == tokenOwner || getApproved(tokenId) == spender || isApprovedForAll(tokenOwner, spender));
    }
    
    function _removeTokenFromUser(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = _userTokens[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }
    
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) internal returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("Transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }
    
    /**
     * @dev Get user's tokens
     */
    function getUserTokens(address user) public view returns (uint256[] memory) {
        return _userTokens[user];
    }
    
    /**
     * @dev Get user's token count
     */
    function getUserTokenCount(address user) public view returns (uint256) {
        return _userTokens[user].length;
    }
    
    /**
     * @dev Generate token URI with encrypted metadata
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        
        ConfidentialNFTAttributes memory attrs = tokenAttributes[tokenId];
        
        // Create metadata with public info only
        string memory json = string(abi.encodePacked(
            '{"name": "2048 Achievement #', _toString(tokenId), '",',
            '"description": "Confidential 2048 game achievement NFT with encrypted score data",',
            '"image": "', _getImageURL(attrs.rarity), '",',
            '"attributes": [',
                '{"trait_type": "Rarity", "value": "', attrs.rarity, '"},',
                '{"trait_type": "Player", "value": "', _toHexString(uint160(attrs.stats.player), 20), '"},',
                '{"trait_type": "Privacy", "value": "Fully Encrypted"}',
            ']}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _base64(bytes(json))));
    }
    
    function _getImageURL(string memory rarity) internal pure returns (string memory) {
        if (keccak256(bytes(rarity)) == keccak256(bytes("Legendary"))) {
            return "https://ipfs.io/ipfs/bafybeicc4xossvnz3acndhqw4zcs4xa2xgiyotpvb3ptishm75qtyeszwq";
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("Epic"))) {
            return "https://ipfs.io/ipfs/bafybeifh6ifdof7mee7rqkw355tnxh2qrlu2nudze7dhbbxeqcvpuele7q";
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("Rare"))) {
            return "https://ipfs.io/ipfs/bafybeiaf3fy7r2evvqlhqqpbwla3lsurie2h6cwanalp7fzpxn3cq7pwgy";
        } else {
            return "https://ipfs.io/ipfs/bafybeighwgusfefm23avzsxpaqbkacrqmywfunx3lx3nywmf23uwxvb45i";
        }
    }
    
    // Helper functions for string conversion and base64 encoding
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = bytes1(uint8(48 + uint256(value % 16)));
            value /= 16;
        }
        require(value == 0, "Hex length insufficient");
        return string(buffer);
    }
    
    function _base64(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        if (data.length == 0) return "";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := shl(248, mload(add(add(data, 32), i)))
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(252, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(246, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(240, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(234, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d)
                mstore8(sub(resultPtr, 1), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
        }
        
        return result;
    }
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}