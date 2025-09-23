#!/usr/bin/env node

/**
 * Development script for FHEVM 2048 Game
 * Starts all development servers concurrently
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎮 FHEVM 2048 Game - Development Mode');
console.log('====================================\n');

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Spawn a process with colored output
 */
function spawnWithColor(command, args, options, color) {
  const child = spawn(command, args, {
    ...options,
    stdio: 'pipe'
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`${color}${data}${colors.reset}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}${data}${colors.reset}`);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.log(`${colors.red}Process exited with code ${code}${colors.reset}`);
    }
  });

  return child;
}

/**
 * Check if development dependencies are installed
 */
function checkDependencies() {
  console.log('📋 Checking development dependencies...');
  
  const projects = [
    { name: 'Frontend', path: './frontend-fhe-game' },
    { name: 'Server', path: './server' }
  ];
  
  projects.forEach(project => {
    const packagePath = path.join(project.path, 'package.json');
    const nodeModulesPath = path.join(project.path, 'node_modules');
    
    if (fs.existsSync(packagePath) && !fs.existsSync(nodeModulesPath)) {
      console.log(`❌ Dependencies not installed for ${project.name}`);
      console.log(`Run: cd ${project.path} && npm install`);
      process.exit(1);
    }
  });
  
  console.log('✅ Dependencies check passed\n');
}

/**
 * Start development servers
 */
function startDevelopmentServers() {
  console.log('🚀 Starting development servers...\n');
  
  const servers = [];
  
  // Start frontend development server
  if (fs.existsSync('./frontend-fhe-game/package.json')) {
    console.log(`${colors.cyan}📱 Starting frontend server (port 3000)...${colors.reset}`);
    const frontend = spawnWithColor(
      'npm',
      ['run', 'dev'],
      { cwd: './frontend-fhe-game' },
      colors.cyan
    );
    servers.push({ name: 'Frontend', process: frontend });
  }
  
  // Start backend development server
  if (fs.existsSync('./server/package.json')) {
    console.log(`${colors.green}🖥️  Starting backend server (port 4009)...${colors.reset}`);
    const backend = spawnWithColor(
      'npm',
      ['run', 'dev'],
      { cwd: './server' },
      colors.green
    );
    servers.push({ name: 'Backend', process: backend });
  }
  
  // Start Hardhat local node (optional)
  if (fs.existsSync('./hardhat.config.js')) {
    console.log(`${colors.yellow}⛓️  Starting Hardhat local node (port 8545)...${colors.reset}`);
    const hardhat = spawnWithColor(
      'npx',
      ['hardhat', 'node'],
      { cwd: '.' },
      colors.yellow
    );
    servers.push({ name: 'Hardhat', process: hardhat });
  }
  
  if (servers.length === 0) {
    console.log('❌ No development servers to start');
    process.exit(1);
  }
  
  console.log('\n🎉 Development servers started!');
  console.log('==============================');
  console.log(`${colors.cyan}Frontend:  http://localhost:3000${colors.reset}`);
  console.log(`${colors.green}Backend:   http://localhost:4009${colors.reset}`);
  if (fs.existsSync('./hardhat.config.js')) {
    console.log(`${colors.yellow}Hardhat:   http://localhost:8545${colors.reset}`);
  }
  console.log('\n📝 Press Ctrl+C to stop all servers\n');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    
    servers.forEach(server => {
      console.log(`⏹️  Stopping ${server.name}...`);
      server.process.kill('SIGTERM');
    });
    
    setTimeout(() => {
      console.log('✅ All servers stopped');
      process.exit(0);
    }, 2000);
  });
  
  // Keep the process running
  servers.forEach(server => {
    server.process.on('exit', (code) => {
      if (code !== 0) {
        console.log(`❌ ${server.name} server crashed with code ${code}`);
      }
    });
  });
}

/**
 * Display helpful development information
 */
function displayDevInfo() {
  console.log('💡 Development Tips:');
  console.log('===================');
  console.log('- Frontend hot reload is enabled');
  console.log('- Backend auto-restarts on file changes');
  console.log('- Check browser console for errors');
  console.log('- API docs available at /health endpoint');
  console.log('- Use Chrome DevTools for debugging');
  console.log('');
  console.log('🔧 Useful Commands:');
  console.log('- npm run test          # Run tests');
  console.log('- npm run lint          # Check code style');
  console.log('- npm run build         # Build for production');
  console.log('- npm run deploy:local  # Deploy to local network');
  console.log('');
}

/**
 * Main development function
 */
async function main() {
  try {
    checkDependencies();
    displayDevInfo();
    startDevelopmentServers();
  } catch (error) {
    console.error('❌ Development startup failed:', error.message);
    process.exit(1);
  }
}

// Run development if this script is executed directly
if (require.main === module) {
  main();
}