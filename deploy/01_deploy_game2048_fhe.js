const { ethers } = require('hardhat');

/**
 * Deploy Game2048FHE_KMS contract to Sepolia testnet
 * Following the spingamefhe deployment pattern
 */
async function main() {
  console.log('🚀 Starting deployment of Game2048FHE_KMS contract...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance < ethers.parseEther('0.01')) {
    console.warn('⚠️  Warning: Low balance, deployment might fail');
  }

  try {
    // Deploy Game2048FHE_KMS contract
    console.log('📦 Deploying Game2048FHE_KMS...');
    const Game2048FHE = await ethers.getContractFactory('Game2048FHE_KMS');
    const game2048 = await Game2048FHE.deploy();
    
    await game2048.waitForDeployment();
    const game2048Address = await game2048.getAddress();
    
    console.log('✅ Game2048FHE_KMS deployed to:', game2048Address);
    
    // Deploy additional contracts if needed
    console.log('📦 Deploying Game2048FHE_Strict...');
    const Game2048Strict = await ethers.getContractFactory('Game2048FHE_Strict');
    const game2048Strict = await Game2048Strict.deploy();
    
    await game2048Strict.waitForDeployment();
    const strictAddress = await game2048Strict.getAddress();
    
    console.log('✅ Game2048FHE_Strict deployed to:', strictAddress);
    
    // Deploy ACL contract
    console.log('📦 Deploying Game2048FHE_ACL_Simple...');
    const ACLContract = await ethers.getContractFactory('Game2048FHE_ACL_Simple');
    const aclContract = await ACLContract.deploy();
    
    await aclContract.waitForDeployment();
    const aclAddress = await aclContract.getAddress();
    
    console.log('✅ Game2048FHE_ACL_Simple deployed to:', aclAddress);
    
    // Output deployment summary
    console.log('\n🎉 Deployment completed successfully!');
    console.log('==========================================');
    console.log('📋 Contract Addresses:');
    console.log('Game2048FHE_KMS:', game2048Address);
    console.log('Game2048FHE_Strict:', strictAddress);
    console.log('Game2048FHE_ACL_Simple:', aclAddress);
    console.log('==========================================');
    
    // Save deployment info
    const deploymentInfo = {
      network: 'sepolia',
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        Game2048FHE_KMS: game2048Address,
        Game2048FHE_Strict: strictAddress,
        Game2048FHE_ACL_Simple: aclAddress
      },
      transactionHashes: {
        Game2048FHE_KMS: game2048.deploymentTransaction()?.hash,
        Game2048FHE_Strict: game2048Strict.deploymentTransaction()?.hash,
        Game2048FHE_ACL_Simple: aclContract.deploymentTransaction()?.hash
      }
    };
    
    console.log('\n📝 Deployment info saved for verification:');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n🔍 Next steps:');
    console.log('1. Verify contracts on Etherscan');
    console.log('2. Update frontend configuration with new addresses');
    console.log('3. Test contract functionality');
    console.log('4. Update environment variables');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Handle script execution
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });