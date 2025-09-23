import React from 'react';
import styles from '@/styles/wallet-modal.module.css';
import toast from 'react-hot-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect: (address: string) => void;
}

interface WalletOption {
  name: string;
  icon: string;
  id: string;
  description: string;
  type: 'evm' | 'bridge';
  priority: number;
}

// EVM wallets get first priority (1-3), bridge wallets get lower priority (4+)
const walletOptions: WalletOption[] = [
  {
    name: 'MetaMask',
    icon: '🦊',
    id: 'metamask',
    description: 'Most popular EVM wallet - Recommended',
    type: 'evm' as const,
    priority: 1
  },
  {
    name: 'Coinbase Wallet',
    icon: '🏦',
    id: 'coinbase',
    description: 'Easy-to-use EVM wallet from Coinbase',
    type: 'evm' as const,
    priority: 2
  },
  {
    name: 'Trust Wallet',
    icon: '🛡️',
    id: 'trust',
    description: 'Secure multi-chain EVM wallet',
    type: 'evm' as const,
    priority: 3
  },
  {
    name: 'WalletConnect',
    icon: '🔗',
    id: 'walletconnect',
    description: 'Connect via QR code with any wallet',
    type: 'bridge' as const,
    priority: 4
  }
].sort((a, b) => a.priority - b.priority); // Sort by priority to ensure EVM wallets appear first

export default function WalletModal({ isOpen, onClose, onWalletConnect }: WalletModalProps) {
  if (!isOpen) return null;

  const connectMetaMask = async () => {
    // Check if MetaMask is specifically installed
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    // Check if MetaMask is the active provider
    if (!window.ethereum.isMetaMask) {
      toast.error('MetaMask is not detected. Please make sure MetaMask is enabled and Phantom/other wallets are disabled.');
      return;
    }

    // For multiple wallets, try to get MetaMask specifically
    let provider = window.ethereum;
    const ethereumWithProviders = window.ethereum as any;
    if (ethereumWithProviders.providers?.length) {
      // Multiple wallets detected, find MetaMask
      provider = ethereumWithProviders.providers.find((p: any) => p.isMetaMask);
      if (!provider) {
        toast.error('MetaMask not found. Please enable MetaMask and disable other wallets.');
        return;
      }
    }

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        onWalletConnect(accounts[0]);
        onClose();
        toast.success('MetaMask connected successfully!');
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Please connect your wallet to continue');
      } else {
        toast.error('Failed to connect MetaMask');
      }
      console.error('Error connecting MetaMask:', error);
    }
  };

  const connectWalletConnect = async () => {
    toast('WalletConnect integration coming soon!', { icon: 'ℹ️' });
    // TODO: Implement WalletConnect integration
  };

  const connectCoinbase = async () => {
    toast('Coinbase Wallet integration coming soon!', { icon: 'ℹ️' });
    // TODO: Implement Coinbase Wallet integration
  };

  const connectTrust = async () => {
    toast('Trust Wallet integration coming soon!', { icon: 'ℹ️' });
    // TODO: Implement Trust Wallet integration
  };

  const handleWalletClick = (walletId: string) => {
    switch (walletId) {
      case 'metamask':
        connectMetaMask();
        break;
      case 'walletconnect':
        connectWalletConnect();
        break;
      case 'coinbase':
        connectCoinbase();
        break;
      case 'trust':
        connectTrust();
        break;
      default:
        toast.error('Wallet not supported yet');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Connect Wallet</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.description}>
            Choose your preferred wallet to connect to the 2048 game
          </p>
          
          <div className={styles.walletList}>
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                className={`${styles.walletOption} ${wallet.type === 'evm' ? styles.evmWallet : ''}`}
                onClick={() => handleWalletClick(wallet.id)}
                disabled={wallet.id !== 'metamask'} // Only MetaMask is fully implemented
              >
                <div className={styles.walletIcon}>{wallet.icon}</div>
                <div className={styles.walletInfo}>
                  <div className={styles.walletName}>
                    {wallet.name}
                    {wallet.type === 'evm' && wallet.priority === 1 && (
                      <span className={styles.recommendedBadge}>Recommended</span>
                    )}
                  </div>
                  <div className={styles.walletDescription}>{wallet.description}</div>
                </div>
                {wallet.id !== 'metamask' && (
                  <div className={styles.comingSoon}>Coming Soon</div>
                )}
              </button>
            ))}
          </div>
          
          <div className={styles.footer}>
            <p className={styles.footerText}>
              New to wallets? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Download MetaMask</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}