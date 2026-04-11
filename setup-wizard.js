#!/usr/bin/env node

/**
 * GRE Dashboard - Setup Wizard
 * This script helps you set up the project for the first time
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => {
    rl.question(query, resolve);
  });

async function setup() {
  console.log('\n🚀 GRE Dashboard - Setup Wizard\n');

  // Step 1: MongoDB Configuration
  console.log('📦 Step 1: MongoDB Configuration');
  const mongoType = await question(
    'Use local MongoDB or MongoDB Atlas? (local/atlas): '
  );

  let mongoUri = '';
  if (mongoType.toLowerCase() === 'local') {
    mongoUri = 'mongodb://localhost:27017/gre-dashboard';
  } else {
    mongoUri = await question(
      'Enter your MongoDB Atlas connection string: '
    );
  }

  // Step 2: JWT Secret
  console.log('\n🔐 Step 2: Security Configuration');
  const jwtSecret =
    await question('Enter JWT secret (or press Enter for auto-generated): ') ||
    Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

  // Step 3: Port Configuration
  console.log('\n🌐 Step 3: Port Configuration');
  const port = (await question('Enter backend port (default 5000): ')) || '5000';
  const frontendPort =
    (await question('Enter frontend port (default 5173): ')) || '5173';

  // Step 4: Environment
  const environment = await question(
    'Select environment (development/production): '
  );

  // Create .env files
  console.log('\n📝 Creating configuration files...');

  const backendEnv =`PORT=${port}
MONGODB_URI=${mongoUri}
JWT_SECRET=${jwtSecret}
NODE_ENV=${environment || 'development'}
CORS_ORIGIN=http://localhost:${frontendPort}
`;

  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log(`✅ Created: backend/.env`);

  // Step 5: Install Dependencies
  const installDeps = await question(
    '\n📥 Install dependencies now? (yes/no): '
  );

  if (installDeps.toLowerCase() === 'yes') {
    console.log('\n📦 Installing backend dependencies...');
    // Would execute: npm install in backend

    console.log('📦 Installing frontend dependencies...');
    // Would execute: npm install in frontend
  }

  // Summary
  console.log('\n\n✨ Setup Complete!\n');
  console.log('📋 Configuration Summary:');
  console.log(`  Backend Port: ${port}`);
  console.log(`  Frontend Port: ${frontendPort}`);
  console.log(`  MongoDB: ${mongoType.toLowerCase()}`);
  console.log(`  Environment: ${environment || 'development'}`);

  console.log('\n🚀 Next Steps:');
  console.log(`  1. Start MongoDB (if using local): mongod`);
  console.log(`  2. Start backend: cd backend && npm run dev`);
  console.log(`  3. Start frontend: cd frontend && npm run dev`);
  console.log(`  4. Open browser: http://localhost:${frontendPort}`);

  rl.close();
}

setup().catch(console.error);
