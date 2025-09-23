#!/usr/bin/env node

/**
 * Setup script for FHEVM 2048 Game development environment
 * Prepares the project for development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎮 FHEVM 2048 Game - Development Setup');
console.log('=====================================\n');

/**
 * Check if a command exists in the system
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check system requirements
 */
function checkRequirements() {
  console.log('📋 Checking system requirements...');
  
  const requirements = [
    { name: 'Node.js', command: 'node', version: '--version' },
    { name: 'npm', command: 'npm', version: '--version' },
    { name: 'Git', command: 'git', version: '--version' }
  ];
  
  let allMet = true;
  
  requirements.forEach(req => {
    if (commandExists(req.command)) {
      try {
        const version = execSync(`${req.command} ${req.version}`, { encoding: 'utf8' }).trim();
        console.log(`✅ ${req.name}: ${version}`);
      } catch {
        console.log(`✅ ${req.name}: Installed`);
      }
    } else {
      console.log(`❌ ${req.name}: Not found`);
      allMet = false;
    }
  });
  
  if (!allMet) {
    console.log('\n❌ Please install missing requirements before continuing.');
    process.exit(1);
  }
  
  console.log('✅ All system requirements met\n');
}

/**
 * Install dependencies for all project parts
 */
function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  const projects = [
    { name: 'Root Project', path: '.' },
    { name: 'Frontend', path: './frontend-fhe-game' },
    { name: 'Server', path: './server' }
  ];
  
  projects.forEach(project => {
    const packageJsonPath = path.join(project.path, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      console.log(`📦 Installing dependencies for ${project.name}...`);
      try {
        execSync('npm install', { 
          cwd: project.path, 
          stdio: 'inherit' 
        });
        console.log(`✅ ${project.name} dependencies installed\n`);
      } catch (error) {
        console.log(`❌ Failed to install dependencies for ${project.name}`);
        console.error(error.message);
      }
    } else {
      console.log(`⚠️  No package.json found for ${project.name}\n`);
    }
  });
}

/**
 * Create environment files if they don't exist
 */
function setupEnvironment() {
  console.log('🔧 Setting up environment files...');
  
  const envFiles = [
    {
      path: './.env.example',
      content: `# FHEVM 2048 Game Environment Configuration
      
# Network Configuration
REACT_APP_FHEVM_CONTRACT_ADDRESS=0x...
REACT_APP_SEPOLIA_RPC_URL=https://rpc.sepolia.org
REACT_APP_CHAIN_ID=11155111

# Zama Configuration  
REACT_APP_RELAYER_URL=https://relayer.testnet.zama.cloud
REACT_APP_DECRYPTION_ADDRESS=0x...

# API Configuration
REACT_APP_BACKEND_API_URL=http://localhost:4009/api
REACT_APP_ETHERSCAN_API_KEY=your_etherscan_api_key

# Development
NODE_ENV=development
PORT=4009

# Oracle Configuration (Server)
ORACLE_PRIVATE_KEY=your_oracle_private_key
FRONTEND_URL=http://localhost:3000`
    },
    {
      path: './frontend-fhe-game/.env.example',
      content: `# Frontend Environment Configuration

# Contract Addresses
REACT_APP_FHEVM_CONTRACT_ADDRESS=0x...
REACT_APP_GAME_TOKEN_ADDRESS=0x...
REACT_APP_GAME_NFT_ADDRESS=0x...

# Network
REACT_APP_SEPOLIA_RPC_URL=https://rpc.sepolia.org
REACT_APP_CHAIN_ID=11155111

# Services
REACT_APP_RELAYER_URL=https://relayer.testnet.zama.cloud
REACT_APP_BACKEND_API_URL=http://localhost:4009/api

# External APIs
REACT_APP_ETHERSCAN_API_KEY=your_etherscan_api_key`
    },
    {
      path: './server/.env.example',
      content: `# Server Environment Configuration

# Server
NODE_ENV=development
PORT=4009
FRONTEND_URL=http://localhost:3000

# Blockchain
REACT_APP_SEPOLIA_RPC_URL=https://rpc.sepolia.org
REACT_APP_FHEVM_CONTRACT_ADDRESS=0x...
ORACLE_PRIVATE_KEY=your_oracle_private_key

# External APIs
REACT_APP_ETHERSCAN_API_KEY=your_etherscan_api_key
REACT_APP_RELAYER_URL=https://relayer.testnet.zama.cloud
REACT_APP_DECRYPTION_ADDRESS=0x...`
    }
  ];
  
  envFiles.forEach(envFile => {
    if (!fs.existsSync(envFile.path)) {
      fs.writeFileSync(envFile.path, envFile.content);
      console.log(`✅ Created ${envFile.path}`);
    } else {
      console.log(`⚠️  ${envFile.path} already exists`);
    }
  });
  
  console.log('✅ Environment setup complete\n');
}

/**
 * Display next steps
 */
function displayNextSteps() {
  console.log('🎉 Setup completed successfully!');
  console.log('================================\n');
  
  console.log('📝 Next steps:');
  console.log('1. Copy .env.example to .env in each directory and fill in your values');
  console.log('2. Deploy contracts: npm run deploy:sepolia');
  console.log('3. Update contract addresses in environment files');
  console.log('4. Start development servers:');
  console.log('   - Frontend: cd frontend-fhe-game && npm run dev');
  console.log('   - Server: cd server && npm run dev');
  console.log('5. Verify contracts: npm run verify:sepolia\n');
  
  console.log('🔗 Useful commands:');
  console.log('- npm run dev:frontend    # Start frontend development server');
  console.log('- npm run dev:server      # Start backend development server');
  console.log('- npm run build:frontend  # Build frontend for production');
  console.log('- npm run deploy:sepolia  # Deploy contracts to Sepolia');
  console.log('- npm run verify:sepolia  # Verify contracts on Etherscan\n');
  
  console.log('📚 Documentation:');
  console.log('- README.md for detailed setup instructions');
  console.log('- contracts/ for smart contract documentation');
  console.log('- frontend-fhe-game/ for frontend documentation');
  console.log('- server/ for backend API documentation\n');
}

/**
 * Main setup function
 */
async function main() {
  try {
    checkRequirements();
    installDependencies();
    setupEnvironment();
    displayNextSteps();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { checkRequirements, installDependencies, setupEnvironment };