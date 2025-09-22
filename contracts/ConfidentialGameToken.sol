// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ConfidentialGameToken
 * @dev A confidential ERC20-like token using FHEVM for the 2048 game
 * Balances and transfers are encrypted for privacy
 */
contract ConfidentialGameToken is GatewayCaller {
    using TFHE for euint64;
    
    string public constant name = "Confidential Game Token";
    string public constant symbol = "CGT";
    uint8 public constant decimals = 18;
    
    // Encrypted total supply
    euint64 private _totalSupply;
    
    // Encrypted balances mapping
    mapping(address => euint64) private _balances;
    
    // Allowances for spending (encrypted)
    mapping(address => mapping(address => euint64)) private _allowances;
    
    // Daily airdrop tracking (encrypted amounts)
    mapping(address => euint64) public lastAirdropDay;
    mapping(address => euint64) public dailyAirdropAmount;
    
    // Events (amounts are encrypted, so we emit encrypted values)
    event Transfer(address indexed from, address indexed to, euint64 value);
    event Approval(address indexed owner, address indexed spender, euint64 value);
    event Airdrop(address indexed to, euint64 amount);
    
    // Owner for administrative functions
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Initialize with encrypted total supply of 1,000,000 tokens
        _totalSupply = TFHE.asEuint64(1000000 * 10**decimals);
        // Give initial supply to contract owner
        _balances[owner] = _totalSupply;
        emit Transfer(address(0), owner, _totalSupply);
    }
    
    /**
     * @dev Returns the encrypted total supply
     */
    function totalSupply() public view returns (euint64) {
        return _totalSupply;
    }
    
    /**
     * @dev Returns the encrypted balance of an account
     * Only the account owner can view their own balance
     */
    function balanceOf(address account) public view returns (euint64) {
        require(msg.sender == account || msg.sender == owner, "Unauthorized");
        return _balances[account];
    }
    
    /**
     * @dev Transfer encrypted amount to another address
     */
    function transfer(address to, bytes calldata encryptedAmount) public returns (bool) {
        euint64 amount = TFHE.asEuint64(encryptedAmount);
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Approve encrypted amount for spending
     */
    function approve(address spender, bytes calldata encryptedAmount) public returns (bool) {
        euint64 amount = TFHE.asEuint64(encryptedAmount);
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Returns encrypted allowance
     */
    function allowance(address tokenOwner, address spender) public view returns (euint64) {
        require(msg.sender == tokenOwner || msg.sender == spender || msg.sender == owner, "Unauthorized");
        return _allowances[tokenOwner][spender];
    }
    
    /**
     * @dev Transfer from one address to another using allowance
     */
    function transferFrom(address from, address to, bytes calldata encryptedAmount) public returns (bool) {
        euint64 amount = TFHE.asEuint64(encryptedAmount);
        euint64 currentAllowance = _allowances[from][msg.sender];
        
        // Check if allowance is sufficient (encrypted comparison)
        ebool sufficientAllowance = TFHE.ge(currentAllowance, amount);
        require(TFHE.decrypt(sufficientAllowance), "Insufficient allowance");
        
        _transfer(from, to, amount);
        _approve(from, msg.sender, TFHE.sub(currentAllowance, amount));
        
        return true;
    }
    
    /**
     * @dev Daily airdrop for game players
     */
    function claimDailyAirdrop() public {
        uint256 currentDay = block.timestamp / 86400; // Day number since epoch
        euint64 lastDay = lastAirdropDay[msg.sender];
        euint64 currentDayEncrypted = TFHE.asEuint64(currentDay);
        
        // Check if user can claim (hasn't claimed today)
        ebool canClaim = TFHE.lt(lastDay, currentDayEncrypted);
        require(TFHE.decrypt(canClaim), "Already claimed today");
        
        // Airdrop amount: 100 tokens
        euint64 airdropAmount = TFHE.asEuint64(100 * 10**decimals);
        
        lastAirdropDay[msg.sender] = currentDayEncrypted;
        dailyAirdropAmount[msg.sender] = TFHE.add(dailyAirdropAmount[msg.sender], airdropAmount);
        
        _balances[msg.sender] = TFHE.add(_balances[msg.sender], airdropAmount);
        _totalSupply = TFHE.add(_totalSupply, airdropAmount);
        
        emit Airdrop(msg.sender, airdropAmount);
        emit Transfer(address(0), msg.sender, airdropAmount);
    }
    
    /**
     * @dev Mint tokens for game achievements (only owner)
     */
    function mint(address to, bytes calldata encryptedAmount) public onlyOwner {
        euint64 amount = TFHE.asEuint64(encryptedAmount);
        _balances[to] = TFHE.add(_balances[to], amount);
        _totalSupply = TFHE.add(_totalSupply, amount);
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Internal transfer function
     */
    function _transfer(address from, address to, euint64 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        
        euint64 fromBalance = _balances[from];
        
        // Check if sender has sufficient balance (encrypted comparison)
        ebool sufficientBalance = TFHE.ge(fromBalance, amount);
        require(TFHE.decrypt(sufficientBalance), "Insufficient balance");
        
        _balances[from] = TFHE.sub(fromBalance, amount);
        _balances[to] = TFHE.add(_balances[to], amount);
        
        emit Transfer(from, to, amount);
    }
    
    /**
     * @dev Internal approve function
     */
    function _approve(address tokenOwner, address spender, euint64 amount) internal {
        require(tokenOwner != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");
        
        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }
    
    /**
     * @dev Decrypt balance for the owner (for debugging/display purposes)
     */
    function decryptBalance(address account) public view onlyOwner returns (uint64) {
        return TFHE.decrypt(_balances[account]);
    }
    
    /**
     * @dev Decrypt total supply for the owner
     */
    function decryptTotalSupply() public view onlyOwner returns (uint64) {
        return TFHE.decrypt(_totalSupply);
    }
}