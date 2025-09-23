// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Game2048FHE_ACL_Simple
 * @dev Simple Access Control List implementation for the 2048 FHE game
 * Provides basic permission management for encrypted operations
 */
contract Game2048FHE_ACL_Simple {
    mapping(address => mapping(address => bool)) public permissions;
    mapping(address => bool) public authorizedOperators;
    
    address public owner;
    
    event PermissionGranted(address indexed user, address indexed operator);
    event PermissionRevoked(address indexed user, address indexed operator);
    event OperatorAuthorized(address indexed operator);
    event OperatorDeauthorized(address indexed operator);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized(address user) {
        require(
            msg.sender == user || 
            permissions[user][msg.sender] || 
            authorizedOperators[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedOperators[msg.sender] = true;
    }
    
    function grantPermission(address operator) external {
        permissions[msg.sender][operator] = true;
        emit PermissionGranted(msg.sender, operator);
    }
    
    function revokePermission(address operator) external {
        permissions[msg.sender][operator] = false;
        emit PermissionRevoked(msg.sender, operator);
    }
    
    function authorizeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
        emit OperatorAuthorized(operator);
    }
    
    function deauthorizeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = false;
        emit OperatorDeauthorized(operator);
    }
    
    function hasPermission(address user, address operator) external view returns (bool) {
        return permissions[user][operator] || authorizedOperators[operator];
    }
}