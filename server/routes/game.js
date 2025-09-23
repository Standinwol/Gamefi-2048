const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

// Game state management endpoints for FHEVM 2048

/**
 * GET /api/game/state/:address
 * Get encrypted game state for a user
 */
router.get('/state/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // TODO: Implement encrypted game state retrieval from blockchain
    // This would interact with the Game2048FHE_KMS contract
    
    res.json({
      address,
      encryptedBoard: null,
      encryptedScore: null,
      encryptedTokens: null,
      lastPlayed: null,
      isActive: false,
      message: 'Game state retrieval not yet implemented'
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/game/move
 * Process a game move with FHE
 */
router.post('/move', async (req, res) => {
  try {
    const { address, direction, encryptedProof, signature } = req.body;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    if (!['up', 'down', 'left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid move direction' });
    }

    // TODO: Verify signature and process encrypted move
    // This would interact with the Game2048FHE_KMS contract
    
    res.json({
      success: true,
      message: 'Move processed successfully',
      transactionHash: null // Would return actual tx hash
    });
  } catch (error) {
    console.error('Error processing move:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/game/start
 * Start a new game session
 */
router.post('/start', async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // TODO: Start new game on blockchain
    
    res.json({
      success: true,
      message: 'Game started successfully',
      gameId: Date.now().toString() // Temporary game ID
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/game/end
 * End current game session and process rewards
 */
router.post('/end', async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // TODO: End game and process rewards
    
    res.json({
      success: true,
      message: 'Game ended successfully',
      finalScore: 0, // Would return actual decrypted score
      rewards: {
        tokens: 0,
        nftEligible: false
      }
    });
  } catch (error) {
    console.error('Error ending game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/game/leaderboard
 * Get public leaderboard (non-encrypted scores)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // TODO: Implement leaderboard from published scores
    
    res.json({
      leaderboard: [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;