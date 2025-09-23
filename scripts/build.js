#!/usr/bin/env node

/**
 * Build script for FHEVM 2048 Game
 * Builds all project components for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  FHEVM 2048 Game - Production Build');
console.log('=====================================\n');

/**
 * Execute command with error handling
 */
function executeCommand(command, cwd = '.', description = '') {
  try {
    console.log(`⚙️  ${description || command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ Completed: ${description || command}\n`);
  } catch (error) {
    console.error(`❌ Failed: ${description || command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Check if build requirements are met
 */
function checkBuildRequirements() {
  console.log('📋 Checking build requirements...');
  
  const requiredFiles = [
    './frontend-fhe-game/package.json',
    './server/package.json',
    './contracts/Game2048FHE_KMS.sol'
  ];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.error(`❌ Required file not found: ${file}`);
      process.exit(1);
    }
  });
  
  console.log('✅ All build requirements met\n');
}

/**
 * Clean previous builds
 */
function cleanBuilds() {
  console.log('🧹 Cleaning previous builds...');
  
  const cleanTargets = [
    './frontend-fhe-game/.next',
    './frontend-fhe-game/out',
    './frontend-fhe-game/dist',
    './server/dist',
    './artifacts',
    './cache'
  ];
  
  cleanTargets.forEach(target => {
    if (fs.existsSync(target)) {
      console.log(`🗑️  Removing ${target}`);
      fs.rmSync(target, { recursive: true, force: true });
    }
  });
  
  console.log('✅ Clean completed\n');
}

/**
 * Install dependencies for all components
 */
function installDependencies() {
  console.log('📦 Installing production dependencies...');
  
  const projects = [
    { name: 'Frontend', path: './frontend-fhe-game' },
    { name: 'Server', path: './server' }
  ];
  
  projects.forEach(project => {
    if (fs.existsSync(path.join(project.path, 'package.json'))) {
      executeCommand(
        'npm ci --only=production',
        project.path,
        `Installing ${project.name} dependencies`
      );
    }
  });
}

/**
 * Build smart contracts
 */
function buildContracts() {
  console.log('🔨 Building smart contracts...');
  
  if (fs.existsSync('./hardhat.config.js')) {
    executeCommand(
      'npx hardhat compile',
      '.',
      'Compiling smart contracts'
    );
  } else {
    console.log('⚠️  No Hardhat config found, skipping contract compilation');
  }
}

/**
 * Build frontend
 */
function buildFrontend() {
  console.log('🎨 Building frontend...');
  
  executeCommand(
    'npm run build',
    './frontend-fhe-game',
    'Building frontend application'
  );
  
  // Check if build was successful
  if (!fs.existsSync('./frontend-fhe-game/.next')) {
    throw new Error('Frontend build failed - .next directory not found');
  }
  
  console.log('✅ Frontend build completed\n');
}

/**
 * Build server (if needed)
 */
function buildServer() {
  console.log('🖥️  Preparing server...');
  
  const serverPackage = path.join('./server/package.json');
  if (fs.existsSync(serverPackage)) {
    const pkg = JSON.parse(fs.readFileSync(serverPackage, 'utf8'));
    
    if (pkg.scripts && pkg.scripts.build) {
      executeCommand(
        'npm run build',
        './server',
        'Building server application'
      );
    } else {
      console.log('ℹ️  No build script found for server, copying files...');
      // Server is likely already in production-ready JavaScript
    }
  }
  
  console.log('✅ Server preparation completed\n');
}

/**
 * Generate deployment info
 */
function generateDeploymentInfo() {
  console.log('📄 Generating deployment information...');
  
  const deploymentInfo = {
    buildTime: new Date().toISOString(),
    version: '1.0.0',
    components: {
      frontend: {
        framework: 'Next.js',
        buildPath: './frontend-fhe-game/.next',
        ready: fs.existsSync('./frontend-fhe-game/.next')
      },
      server: {
        framework: 'Express.js',
        buildPath: './server/src',
        ready: fs.existsSync('./server/src/index.js')
      },
      contracts: {
        compiled: fs.existsSync('./artifacts'),
        ready: fs.existsSync('./contracts')
      }
    },
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  fs.writeFileSync(
    './deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('✅ Deployment info saved to deployment-info.json\n');
}

/**
 * Display deployment instructions
 */
function displayDeploymentInstructions() {
  console.log('🚀 Build completed successfully!');
  console.log('================================\n');
  
  console.log('📦 Built components:');
  console.log('- Frontend: ./frontend-fhe-game/.next');
  console.log('- Server: ./server/src');
  console.log('- Contracts: ./artifacts (if compiled)\n');
  
  console.log('🌐 Deployment options:');
  console.log('');
  console.log('Frontend (Next.js):');
  console.log('- Vercel: Connect GitHub repo to Vercel');
  console.log('- Netlify: Deploy ./frontend-fhe-game/.next');
  console.log('- Custom: Use "npm start" in frontend directory');
  console.log('');
  console.log('Server (Express.js):');
  console.log('- Render: Connect GitHub repo');
  console.log('- Railway: Deploy from ./server');
  console.log('- DigitalOcean: Use Dockerfile or direct deployment');
  console.log('- Custom: Use "npm start" in server directory');
  console.log('');
  console.log('Smart Contracts:');
  console.log('- Run: npm run deploy:sepolia');
  console.log('- Then: npm run verify:sepolia');
  console.log('');
  
  console.log('⚠️  Remember to:');
  console.log('1. Set environment variables in production');
  console.log('2. Update contract addresses after deployment');
  console.log('3. Configure CORS for production domains');
  console.log('4. Set up monitoring and logging\n');
}

/**
 * Main build function
 */
async function main() {
  try {
    checkBuildRequirements();
    cleanBuilds();
    installDependencies();
    buildContracts();
    buildFrontend();
    buildServer();
    generateDeploymentInfo();
    displayDeploymentInstructions();
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build if this script is executed directly
if (require.main === module) {
  main();
}