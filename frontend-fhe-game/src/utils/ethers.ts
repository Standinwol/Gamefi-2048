import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config';
import { GAME_TOKEN_ABI } from '../abi/GameToken';
import { GAME_NFT_ABI } from '../abi/GameNFT';
import { MARKETPLACE_ABI } from '../abi/Marketplace';

// Sepolia Network Configuration
export const SEPOLIA_CHAIN_ID = NETWORK_CONFIG.chainId;

// 检查钱包是否已连接
export const isWalletConnected = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

// 获取provider
export const getProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Please install MetaMask!');
  }
  return new BrowserProvider(window.ethereum);
};

// 获取signer
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// 获取GameToken合约实例
export const getGameTokenContract = async (providerOrSigner: any) => {
  try {
    if (!CONTRACT_ADDRESSES.GAME_TOKEN) {
      throw new Error('GameToken contract address is not configured');
    }
    return new Contract(
      CONTRACT_ADDRESSES.GAME_TOKEN,
      GAME_TOKEN_ABI,
      providerOrSigner
    );
  } catch (error) {
    console.error('Error creating GameToken contract:', error);
    return null;
  }
};

// 获取GameNFT合约实例
export const getGameNFTContract = async (providerOrSigner: any) => {
  try {
    if (!CONTRACT_ADDRESSES.GAME_NFT) {
      throw new Error('GameNFT contract address is not configured');
    }
    console.log('Creating GameNFT contract with address:', CONTRACT_ADDRESSES.GAME_NFT);
    return new Contract(
      CONTRACT_ADDRESSES.GAME_NFT,
      GAME_NFT_ABI,
      providerOrSigner
    );
  } catch (error) {
    console.error('Error creating GameNFT contract:', error);
    return null;
  }
};

// 获取Marketplace合约实例
export const getMarketplaceContract = async (providerOrSigner: any) => {
  try {
    if (!CONTRACT_ADDRESSES.MARKETPLACE) {
      throw new Error('Marketplace contract address is not configured');
    }
    return new Contract(
      CONTRACT_ADDRESSES.MARKETPLACE,
      MARKETPLACE_ABI,
      providerOrSigner
    );
  } catch (error) {
    console.error('Error creating Marketplace contract:', error);
    return null;
  }
};

// Check and switch to Sepolia network
export const checkAndSwitchNetwork = async () => {
  try {
    if (!window.ethereum) return false;

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);
    
    if (currentChainId !== SEPOLIA_CHAIN_ID) {
      try {
        // Try to switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
        return true;
      } catch (error: any) {
        if (error.code === 4902) {
          // If network doesn't exist, add Sepolia network
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                  chainName: NETWORK_CONFIG.name,
                  nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                  rpcUrls: [NETWORK_CONFIG.rpcUrl],
                  blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
                },
              ],
            });
            return true;
          } catch (addError) {
            console.error('Error adding Sepolia network:', addError);
            return false;
          }
        }
        console.error('Error switching to Sepolia:', error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Check wallet connection status
export const checkConnection = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0;
  } catch {
    return false;
  }
};

// Disconnect wallet
export const disconnect = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Clear local storage connection state
      localStorage.removeItem('walletConnected');

      // For MetaMask, clear connection state at app level
      if (window.ethereum.isMetaMask) {
        // MetaMask doesn't provide a true "disconnect" API
        // We just clear the state at the application level
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }
};

// Initialize network check on app startup
checkAndSwitchNetwork(); 