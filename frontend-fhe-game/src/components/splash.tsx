import { useState, useContext } from 'react';
import styles from "@/styles/splash.module.css";
import { toast } from 'react-hot-toast';
import { getProvider, getSigner, getGameNFTContract, getGameTokenContract, checkAndSwitchNetwork } from '../utils/ethers';
import { GameContext } from "@/context/game-context";

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
      const provider = getProvider();
      const accounts = await provider.send('eth_accounts', []);
      
      if (accounts.length === 0) {
        toast.error('Please connect your wallet first');
        return;
      }

      setIsLoading(true);
      
      const networkSwitched = await checkAndSwitchNetwork();
      if (!networkSwitched) {
        toast.error('Please switch to Sepolia network');
        return;
      }

      const signer = await getSigner();
      const nftContract = await getGameNFTContract(signer);
      const tokenContract = await getGameTokenContract(signer);

      if (!nftContract || !tokenContract) {
        toast.error('Contract initialization failed');
        return;
      }
      
      // Get NFT mint price
      const mintPrice = await nftContract.mintPrice();
      
      // Approve GameToken for NFT minting
      const approveTx = await tokenContract.approve(
        nftContract.target,  // NFT contract address
        mintPrice  // Approval amount
      );
      
      const approveToast = toast.loading('Approving GameToken...');
      await approveTx.wait();
      console.log('Approve successful!');
      toast.dismiss(approveToast);
      toast.success('Approval successful!');

      const score = BigInt(maxScore || 0);
      const timestamp = Math.floor(Date.now() / 1000).toString();
      console.log('Minting with score:', score, 'timestamp:', timestamp);
      
      const tx = await nftContract.mint(
        score,  // Game score
        timestamp,    // Timestamp
      );

      const mintingToast = toast.loading('Minting NFT...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      toast.dismiss(mintingToast);
      toast.success('NFT Minted Successfully! 🎉');
      
      console.log('NFT minted successfully');

    } catch (error: any) {
      console.error('Error minting NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelled transaction');
      } else {
        toast.error('Mint failed: ' + (error.message || 'Unknown error'));
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
