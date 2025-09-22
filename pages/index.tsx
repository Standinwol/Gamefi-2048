import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/index.module.css';
import Board from '@/components/board';
import Score from '@/components/score';
import WalletModal from '@/components/WalletModal';
import { GameContext } from '@/context/game-context';
import { useContext } from 'react';
import toast from 'react-hot-toast';



export default function Home() {
  const { startGame } = useContext(GameContext);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    // Only listen for account changes, no automatic connection check
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : '');
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup function
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    toast.success('Wallet disconnected');
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>2048 on MONAD</title>
        <meta name="description" content="2048 Game on MONAD blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      {/* Top Navigation with Connect Wallet Button */}
      <div className={styles.topNav}>
        <div className={styles.navContent}>
          <div className={styles.navLeft}></div>
          <div className={styles.navRight}>
            {walletAddress ? (
              <div className={styles.walletConnected}>
                <span className={styles.connectedAddress}>
                  {formatAddress(walletAddress)}
                </span>
                <button 
                  className={styles.copyAddressBtn}
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  title="Copy address"
                >
                  📋
                </button>
                <button 
                  className={styles.disconnectBtn}
                  onClick={disconnectWallet}
                  title="Disconnect wallet"
                >
                  ×
                </button>
              </div>
            ) : (
              <button 
                className={styles.connectWalletBtn}
                onClick={openWalletModal}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Main Title */}
        <div className={styles.titleSection}>
          <h1 className={styles.mainTitle}>2048</h1>
          <h2 className={styles.subtitle}>on MONAD</h2>
        </div>

        {/* Game Controls */}
        <div className={styles.gameControls}>
          <div className={styles.leftControls}>
            <Score />
          </div>
          <div className={styles.rightControls}>
            <button className={styles.newGameButton} onClick={startGame}>
              New Game
            </button>
            {walletAddress && (
              <div className={styles.playerInfo}>
                <span className={styles.playerLabel}>Player:</span>
                <span className={styles.playerAddress}>{formatAddress(walletAddress)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className={styles.gameMain}>
          <Board />
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <p>Use arrow keys to move the tiles.</p>
          <p>Join the numbers and get to the 2048 tile!</p>
        </div>
      </div>

      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnect={handleWalletConnect}
      />
    </div>
  );
}
