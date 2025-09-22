import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/index.module.css';
import Board from '@/components/board';
import Score from '@/components/score';
import { GameContext } from '@/context/game-context';
import { useContext } from 'react';

export default function Home() {
  const { startGame } = useContext(GameContext);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    // Check if wallet is connected
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };
    checkWallet();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : '');
      });
    }
  }, []);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-2)}`;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>2048 on MONAD</title>
        <meta name="description" content="2048 Game on MONAD blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

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
                <button 
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  title="Copy address"
                >
                  📋
                </button>
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
    </div>
  );
}
