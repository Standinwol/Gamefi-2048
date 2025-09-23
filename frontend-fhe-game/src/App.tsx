import React, { useState, useContext } from 'react';
import GameProvider, { GameContext } from './context/game-context';
import Board from './components/board';
import Score from './components/score';
import Sidebar from './components/sidebar';
import WalletModal from './components/WalletModal';
import Splash from './components/splash';
import './styles/globals.css';

/**
 * Game component that uses the GameContext
 */
function GameComponent() {
  const { status, maxScore, gameEndTime } = useContext(GameContext);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setConnectedWallet(address);
    setIsWalletModalOpen(false);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>2048 FHE Game</h1>
        <Score />
        <button 
          className="wallet-button"
          onClick={() => setIsWalletModalOpen(true)}
        >
          {connectedWallet ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
      <Board />
      <Sidebar />
      
      {/* Show splash when game is ended or lost */}
      {(status === 'ended' || status === 'lost') && (
        <Splash 
          heading={status === 'lost' ? 'Better luck next time!' : 'Congratulations!'}
          type={status as 'ended' | 'lost'}
          maxScore={maxScore}
          gameEndTime={gameEndTime}
        />
      )}
      
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnect={handleWalletConnect}
      />
    </div>
  );
}

/**
 * Main App component for the 2048 FHE Game
 * Privacy-first blockchain game with Fully Homomorphic Encryption
 */
function App() {
  return (
    <GameProvider>
      <div className="App">
        <GameComponent />
      </div>
    </GameProvider>
  );
}

export default App;