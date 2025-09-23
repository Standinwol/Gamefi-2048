const { ethers } = require('hardhat');

/**
 * Verify deployed contracts on Etherscan
 * Run after deployment to verify contract source code
 */
async function main() {
  console.log('🔍 Starting contract verification...');
  
  // Contract addresses - UPDATE THESE WITH YOUR DEPLOYED ADDRESSES
  const contracts = {
    Game2048FHE_KMS: '0x...', // Update with actual deployed address
    Game2048FHE_Strict: '0x...', // Update with actual deployed address  
    Game2048FHE_ACL_Simple: '0x...' // Update with actual deployed address
  };
  
  console.log('📋 Contracts to verify:');
  Object.entries(contracts).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  
  try {
    // Verify Game2048FHE_KMS
    if (contracts.Game2048FHE_KMS !== '0x...') {
      console.log('🔍 Verifying Game2048FHE_KMS...');
      await hre.run('verify:verify', {
        address: contracts.Game2048FHE_KMS,
        constructorArguments: [],
      });
      console.log('✅ Game2048FHE_KMS verified');
    }
    
    // Verify Game2048FHE_Strict
    if (contracts.Game2048FHE_Strict !== '0x...') {
      console.log('🔍 Verifying Game2048FHE_Strict...');
      await hre.run('verify:verify', {
        address: contracts.Game2048FHE_Strict,
        constructorArguments: [],
      });
      console.log('✅ Game2048FHE_Strict verified');
    }
    
    // Verify Game2048FHE_ACL_Simple
    if (contracts.Game2048FHE_ACL_Simple !== '0x...') {
      console.log('🔍 Verifying Game2048FHE_ACL_Simple...');
      await hre.run('verify:verify', {
        address: contracts.Game2048FHE_ACL_Simple,
        constructorArguments: [],
      });
      console.log('✅ Game2048FHE_ACL_Simple verified');
    }
    
    console.log('\n🎉 All contracts verified successfully!');
    console.log('📱 You can now view the verified contracts on Etherscan:');
    Object.entries(contracts).forEach(([name, address]) => {
      if (address !== '0x...') {
        console.log(`${name}: https://sepolia.etherscan.io/address/${address}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    
    if (error.message.includes('already verified')) {
      console.log('ℹ️  Some contracts were already verified');
    } else {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure contract addresses are correct');
      console.log('2. Wait a few minutes after deployment before verifying');
      console.log('3. Check that Etherscan API key is configured');
      console.log('4. Ensure constructor arguments match deployment');
    }
  }
}

// Handle script execution
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });