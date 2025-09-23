require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('dotenv').config();

/**
 * Hardhat configuration for FHEVM 2048 Game
 * Configured for Sepolia testnet deployment and local development
 */

const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/_oSFSXH0O9XXc6h7hdLQ0mkBEzr9bm4B';
const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || '0x' + '0'.repeat(64);
const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY || '';

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true // Enables more advanced optimizations
    }
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: '10000000000000000000000' // 10,000 ETH
      }
    },
    
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    },
    
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== '0x' + '0'.repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 'auto',
      gas: 'auto'
    }
  },
  
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    gasPrice: 20,
    showTimeSpent: true,
    showMethodSig: true
  },
  
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  
  mocha: {
    timeout: 40000
  }
};