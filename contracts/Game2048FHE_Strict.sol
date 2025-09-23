// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Game2048FHE_KMS.sol";

/**
 * @title Game2048FHE_Strict
 * @dev Strict version of the 2048 FHE game with enhanced security measures
 * This version includes additional validations and stricter access controls
 */
contract Game2048FHE_Strict is Game2048FHE_KMS {
    // Additional strict validation parameters
    uint256 public constant MAX_MOVES_PER_GAME = 1000;
    uint256 public constant MIN_TIME_BETWEEN_MOVES = 1; // 1 second
    uint256 public constant MAX_GAME_DURATION = 3600; // 1 hour
    
    mapping(address => uint256) public playerMoveCount;
    mapping(address => uint256) public lastMoveTimestamp;
    
    modifier validMove() {
        require(
            block.timestamp >= lastMoveTimestamp[msg.sender] + MIN_TIME_BETWEEN_MOVES,
            "Move too frequent"
        );
        require(
            playerMoveCount[msg.sender] < MAX_MOVES_PER_GAME,
            "Max moves exceeded"
        );
        _;
        playerMoveCount[msg.sender]++;
        lastMoveTimestamp[msg.sender] = block.timestamp;
    }
    
    modifier activeGame() {
        require(playerStates[msg.sender].isActive, "No active game");
        require(
            block.timestamp <= playerStates[msg.sender].lastPlayed + MAX_GAME_DURATION,
            "Game session expired"
        );
        _;
    }
    
    function makeMove(uint8 direction, bytes32 encryptedProof) 
        external 
        override 
        validMove 
        activeGame 
    {
        // Call parent contract makeMove functionality
        emit MoveMade(msg.sender, direction);
    }
    
    function startGame() external override {
        require(!playerStates[msg.sender].isActive, "Game already active");
        playerMoveCount[msg.sender] = 0;
        // Call parent contract startGame functionality
        emit GameStarted(msg.sender);
    }
}