const { ethers } = require('ethers');

/**
 * Ethereum utility functions for the server
 */

/**
 * Initialize provider for blockchain interactions
 */
function getProvider() {
  const rpcUrl = process.env.REACT_APP_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Verify an Ethereum signature
 * @param {string} message - Original message that was signed
 * @param {string} signature - The signature to verify
 * @param {string} expectedAddress - Expected signer address
 * @returns {boolean} True if signature is valid
 */
function verifySignature(message, signature, expectedAddress) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Get contract instance
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @param {boolean} withSigner - Whether to include signer
 * @returns {ethers.Contract} Contract instance
 */
function getContract(contractAddress, abi, withSigner = false) {
  const provider = getProvider();
  
  if (withSigner) {
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Oracle private key not configured');
    }
    const signer = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(contractAddress, abi, signer);
  }
  
  return new ethers.Contract(contractAddress, abi, provider);
}

/**
 * Parse Ethereum logs for events
 * @param {Array} logs - Transaction logs
 * @param {ethers.Contract} contract - Contract instance
 * @param {string} eventName - Event name to parse
 * @returns {Array} Parsed events
 */
function parseEvents(logs, contract, eventName) {
  const eventTopic = contract.interface.getEventTopic(eventName);
  
  return logs
    .filter(log => log.topics[0] === eventTopic)
    .map(log => {
      try {
        return contract.interface.parseLog(log);
      } catch (error) {
        console.error('Error parsing log:', error);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Create a message for signature verification
 * @param {string} action - Action being performed
 * @param {string} address - User address
 * @param {number} timestamp - Timestamp
 * @returns {string} Message to sign
 */
function createSignatureMessage(action, address, timestamp) {
  return `FHEVM 2048 Game\nAction: ${action}\nAddress: ${address}\nTimestamp: ${timestamp}`;
}

/**
 * Check if signature is recent (within 5 minutes)
 * @param {number} timestamp - Timestamp from signature
 * @returns {boolean} True if recent
 */
function isRecentTimestamp(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return Math.abs(now - timestamp) <= fiveMinutes;
}

/**
 * Format Ethereum address for display
 * @param {string} address - Full address
 * @returns {string} Formatted address
 */
function formatAddress(address) {
  if (!ethers.isAddress(address)) {
    return '';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Convert Wei to Ether
 * @param {string|number|BigInt} wei - Wei amount
 * @returns {string} Ether amount
 */
function weiToEther(wei) {
  return ethers.formatEther(wei);
}

/**
 * Convert Ether to Wei
 * @param {string|number} ether - Ether amount
 * @returns {BigInt} Wei amount
 */
function etherToWei(ether) {
  return ethers.parseEther(ether.toString());
}

module.exports = {
  getProvider,
  verifySignature,
  getContract,
  parseEvents,
  createSignatureMessage,
  isRecentTimestamp,
  formatAddress,
  weiToEther,
  etherToWei
};