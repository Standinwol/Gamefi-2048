# 🎮 FHEVM 2048 Game - Privacy-First Blockchain Gaming

A secure, verifiable 2048 game built with Zama FHEVM (Fully Homomorphic Encryption Virtual Machine) that provides confidential gameplay and private scoring on Ethereum blockchain.

Author: @Standinwol

## 🌟 Features

### 🔐 Privacy-First Design

- **Encrypted Game State**: All player data (board state, score, tokens, NFTs) are encrypted on-chain
- **Private Transactions**: Game moves are performed with encrypted inputs
- **Zero-Knowledge Proofs**: Verifiable gameplay without revealing game state
- **User-Decrypt Authorization**: Players control their own data decryption

### 🎮 Game Mechanics

- **Classic 2048 Gameplay**: Slide tiles to combine numbers and reach 2048
- **Blockchain Integration**: Every move is recorded on-chain with privacy
- **NFT Rewards**: Mint unique NFTs based on your game achievements
- **Token System**: Earn GameTokens through gameplay
- **Leaderboard**: Publish scores to compete with other players (optional)
- **Secure Claiming**: Decentralized reward claiming with Key Management Service

### 🏗️ Technical Architecture

- **Smart Contracts**: Game2048FHE_KMS.sol - Optimized for FHE efficiency
- **Frontend**: React + TypeScript with Next.js and FHE SDK integration
- **Backend**: Express.js API for user state aggregation and oracle attestations
- **Relayer**: Zama Relayer for encrypted transaction processing
- **Network**: Sepolia Testnet (Ethereum)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Sepolia ETH for gas fees

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Standinwol/fhevm-2048-game.git
cd fhevm-2048-game
```

2. **Install dependencies**

```bash
# Install all dependencies
npm install

# Or run setup script
npm run setup
```

3. **Configure environment**

```bash
# Copy environment template
cp .env.example .env

# Update with your configuration
REACT_APP_FHEVM_CONTRACT_ADDRESS=0x...
REACT_APP_RELAYER_URL=https://relayer.testnet.zama.cloud
REACT_APP_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
REACT_APP_ETHERSCAN_API_KEY=your-etherscan-api-key
ORACLE_PRIVATE_KEY=your-deployment-private-key
```

4. **Deploy contracts (optional - for development)**

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify contracts
npm run verify:sepolia
```

5. **Start the application**

```bash
# Start all development servers
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on port 3000
npm run dev:server    # Backend on port 4009
```

6. **Connect your wallet**

- Open MetaMask and connect to Sepolia Testnet
- Connect your wallet to the application
- Grant user-decrypt authorization when prompted

## 🛠️ Development

### Project Structure

```
fhevm-2048-game/
├── contracts/                     # Smart contracts
│   ├── Game2048FHE_KMS.sol       # Main game contract
│   ├── Game2048FHE_Strict.sol    # Strict validation version
│   └── Game2048FHE_ACL_Simple.sol # Access control contract
├── frontend-fhe-game/             # React frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom hooks
│   │   ├── utils/                # Utility functions
│   │   ├── abi/                  # Contract ABIs
│   │   ├── pages/                # Next.js pages
│   │   └── styles/               # CSS modules
│   └── public/
│       └── wasm/                 # FHE WASM files
├── server/                        # Express API server
│   ├── src/
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   └── utils/                    # Server utilities
├── deploy/                        # Deployment scripts
├── scripts/                       # Utility scripts
└── README.md
```

### Development Commands

```bash
# Setup and installation
npm run setup              # Initial project setup
npm install                # Install dependencies

# Development
npm run dev                # Start all development servers
npm run dev:frontend       # Start frontend only
npm run dev:server         # Start backend only

# Building
npm run build              # Build all components
npm run build:frontend     # Build frontend
npm run build:server       # Build server

# Smart contracts
npm run compile            # Compile contracts
npm run deploy:sepolia     # Deploy to Sepolia
npm run verify:sepolia     # Verify on Etherscan
npm run test:contracts     # Run contract tests

# Testing
npm run test:frontend      # Run frontend tests
npm run lint               # Run linting
npm run format             # Format code
```

## 🎯 How to Play

### 1. Get Started

- Connect your MetaMask wallet
- Start a new game (encrypted on-chain)
- Use arrow keys or swipe to move tiles

### 2. Play the Game

- Combine tiles with the same number to create larger numbers
- Try to reach the 2048 tile (or go even higher!)
- Each move is recorded privately on the blockchain

### 3. Claim Rewards

- **GameTokens**: Automatically earned based on score
- **NFT Rewards**: Mint unique NFTs for high scores
- **Leaderboard**: Optionally publish your score to compete

## 🔧 Smart Contracts

### Contract Addresses

```bash
# Update after deployment
Sepolia: 0x... (Game2048FHE_KMS)
Sepolia: 0x... (Game2048FHE_Strict)
Sepolia: 0x... (Game2048FHE_ACL_Simple)
```

### Key Functions

#### Game Actions

- `startGame()` - Initialize new encrypted game session
- `makeMove(direction, encryptedProof)` - Submit encrypted move
- `endGame()` - Finalize game and process rewards

#### FHE Operations

- `getEncryptedBoard(address user)` - Get encrypted board state
- `getEncryptedScore(address user)` - Get encrypted score
- `getUserGameTokens(address user)` - Get encrypted token balance

#### KMS Claim System

- `requestClaimTokens(uint256 amount)` - Request token withdrawal
- `onClaimDecrypted(address user, uint256 amount)` - KMS callback for transfer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add proper error handling for FHE operations
- Include comprehensive tests
- Update documentation for new features
- Ensure privacy-first design principles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama Team** - For the amazing FHEVM technology
- **Ethereum Foundation** - For the blockchain infrastructure
- **MetaMask** - For wallet integration
- **Hardhat** - For development tools
- **Next.js Team** - For the excellent React framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Standinwol/fhevm-2048-game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Standinwol/fhevm-2048-game/discussions)
- **Author**: [@Standinwol](https://github.com/Standinwol)

---

⚠️ **Disclaimer**: This is a demo application for educational purposes. Use at your own risk and never use real funds on testnet applications.