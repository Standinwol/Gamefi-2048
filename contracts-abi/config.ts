// Original contract addresses (non-FHEVM)
export const CONTRACT_ADDRESSES = {
  // GAME_TOKEN: '0x5d768b72b6a41cB84B021A169E0B77a7b6b06f49',
  // GAME_NFT: '0x37eAD756497bBc8e69a16DC260FaB698309b0067',
  // MARKETPLACE: '0x3045e820CcF4059cE1747F033e8D6246F43850dB'
  // GAME_TOKEN: '0x09421D4e8594D3B19ABFc9c1C44096fa3BaAB6e1',
  // GAME_NFT: '0x459287afB0daf7e7FDCcA4bda08C8a5bd0BfE230',
  // MARKETPLACE: '0x60cda54041199A7Fa74738053F6D78527A9120c6'
  GAME_TOKEN: '0x4A3Ec63705BB4BCcBaFcabfD8D7B6e9986082489',
  GAME_NFT: '0x63F6082C3B8193d43EE146d790DF30925442B645',
  MARKETPLACE: '0x459287afB0daf7e7FDCcA4bda08C8a5bd0BfE230'
} as const;

// FHEVM confidential contract addresses (for development)
// These should be replaced with actual deployed contract addresses
export const FHEVM_CONTRACT_ADDRESSES = {
  CONFIDENTIAL_GAME_TOKEN: '0x0000000000000000000000000000000000000001', // Replace with actual address
  CONFIDENTIAL_GAME_NFT: '0x0000000000000000000000000000000000000002',   // Replace with actual address
  CONFIDENTIAL_MARKETPLACE: '0x0000000000000000000000000000000000000003' // Replace with actual address
} as const;

// FHEVM network configuration
export const FHEVM_NETWORK = {
  chainId: 8009, // Zama Devnet
  name: 'Zama Devnet',
  rpcUrl: 'https://devnet.zama.ai/',
  blockExplorer: 'https://main.explorer.zama.ai/',
  nativeCurrency: {
    name: 'ZAMA',
    symbol: 'ZAMA',
    decimals: 18
  }
} as const; 