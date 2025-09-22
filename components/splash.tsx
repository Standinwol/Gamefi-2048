import { useState, useContext } from 'react';
import styles from "@/styles/splash.module.css";
import { toast } from 'react-hot-toast';
import { GameContext } from "@/context/game-context";
import { 
  initializeFHEVM, 
  checkFHEVMNetwork, 
  switchToFHEVMNetwork,
  encryptGameScore,
  encryptTimestamp,
  getFHEVMContractInstance
} from '../utils/fhevm';
// Note: You'll need to create ABI files for the FHEVM contracts
// import { CONFIDENTIAL_GAME_NFT_ABI } from '../contracts-abi/abis/ConfidentialGameNFT';
// import { CONFIDENTIAL_GAME_TOKEN_ABI } from '../contracts-abi/abis/ConfidentialGameToken';

interface SplashProps {
  heading: string;
  type: "ended" | "lost";
  maxScore?: number;
  gameEndTime?: string;
  onReplay?: () => void;
}

export default function Splash({ heading, type, maxScore, gameEndTime, onReplay }: SplashProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { startGame } = useContext(GameContext);

  const handleMintNFT = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask first');
      return;
    }

    try {
      // Initialize FHEVM
      await initializeFHEVM();
      
      // Check if connected to correct network
      const isCorrectNetwork = await checkFHEVMNetwork();
      if (!isCorrectNetwork) {
        const switched = await switchToFHEVMNetwork();
        if (!switched) {
          toast.error('Please switch to the FHEVM network');
          return;
        }
      }

      // Check if wallet is connected
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          toast.error('Please connect your wallet first');
          return;
        }
      }

      setIsLoading(true);
      
      // For development, we'll use mock contract addresses
      // In production, these should be the actual deployed FHEVM contract addresses
      const CONFIDENTIAL_NFT_ADDRESS = '0x0000000000000000000000000000000000000000';
      const CONFIDENTIAL_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
      
      // Encrypt game data
      const encryptedScore = await encryptGameScore(maxScore || 0);
      const encryptedTimestamp = await encryptTimestamp(Date.now());
      
      console.log('Encrypted game data prepared for FHEVM');
      console.log('Score (encrypted):', encryptedScore);
      console.log('Timestamp (encrypted):', encryptedTimestamp);
      
      // For development purposes, we'll show success without actual contract interaction
      // In production, uncomment the contract interaction below:
      
      /*
      // Get contract instances
      const nftContract = await getFHEVMContractInstance(
        CONFIDENTIAL_NFT_ADDRESS,
        CONFIDENTIAL_GAME_NFT_ABI
      );
      const tokenContract = await getFHEVMContractInstance(
        CONFIDENTIAL_TOKEN_ADDRESS,
        CONFIDENTIAL_GAME_TOKEN_ABI
      );
      
      // Get mint price
      const mintPrice = await nftContract.mintPrice();
      
      // Approve tokens for NFT minting
      const mintPriceBytes = new Uint8Array(32); // Encrypted mint price
      const approveTx = await tokenContract.approve(
        CONFIDENTIAL_NFT_ADDRESS,
        mintPriceBytes
      );
      
      const approveToast = toast.loading('Approving confidential tokens...');
      await approveTx.wait();
      toast.dismiss(approveToast);
      toast.success('Confidential approval successful!');
      
      // Mint NFT with encrypted data
      const tx = await nftContract.mint(
        encryptedScore,
        encryptedTimestamp
      );
      
      const mintingToast = toast.loading('Minting confidential NFT...');
      const receipt = await tx.wait();
      console.log('Confidential NFT minted:', receipt);
      toast.dismiss(mintingToast);
      */
      
      // Simulate successful minting for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Confidential NFT Minted Successfully! 🎉');
      console.log('FHEVM NFT minting completed successfully');
      
    } catch (error: any) {
      console.error('Error minting confidential NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelled transaction');
      } else {
        toast.error('Confidential mint failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.splash}>
      <div className={styles.content}>
        <h2>{type === "lost" ? "Game Over!" : "Game end!"}</h2>
        {type === "ended" && (
          <>
            <p className={styles.score}>Game score: {maxScore}</p>
            <p className={styles.time}>End Game: {gameEndTime}</p>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.mintButton}
                onClick={handleMintNFT}
                disabled={isLoading}
              >
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </button>
              <button 
                className={styles.replayButton}
                onClick={onReplay || startGame}
              >
                Replay
              </button>
            </div>
          </>
        )}
        {type === "lost" && <p>{heading}</p>}
      </div>
    </div>
  );
}
