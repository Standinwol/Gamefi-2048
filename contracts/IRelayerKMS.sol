// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRelayerKMS
 * @dev Interface for KMS (Key Management Service) relayer functionality
 * Used for encrypted operations in FHEVM contracts
 */
interface IRelayerKMS {
    /**
     * @dev Callback function for KMS decryption results
     * @param user The user address for whom decryption was performed
     * @param data The decrypted data
     */
    function onDecryptionResult(address user, bytes calldata data) external;
    
    /**
     * @dev Request decryption of encrypted data
     * @param encryptedData The encrypted data to decrypt
     * @param user The user address requesting decryption
     */
    function requestDecryption(bytes32 encryptedData, address user) external;
}