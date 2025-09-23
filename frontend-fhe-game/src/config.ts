// Contract addresses for Ethereum Sepolia Network
export const CONTRACT_ADDRESSES = {
  GAME_TOKEN: '0x5d768b72b6a41cB84B021A169E0B77a7b6b06f49',
  GAME_NFT: '0x37eAD756497bBc8e69a16DC260FaB698309b0067',
  MARKETPLACE: '0x3045e820CcF4059cE1747F033e8D6246F43850dB'
} as const;

// Ethereum Sepolia Network Configuration with Alchemy API
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia testnet
  name: 'Sepolia Test Network',
  rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/_oSFSXH0O9XXc6h7hdLQ0mkBEzr9bm4B',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18
  },
  faucets: [
    'https://www.alchemy.com/faucets/ethereum-sepolia',
    'https://faucets.chain.link/sepolia'
  ]
} as const; 