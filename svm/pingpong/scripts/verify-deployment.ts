#!/usr/bin/env ts-node

// Simple Solana program verification script
// This script verifies that our program is successfully deployed to devnet

async function main() {
  console.log('=== Solana Program Verification ===');
  console.log('Program ID: 87KQ61XNxoEcq3p1ZDaRJ1NwPHKCJpbKbeEEzkuK3rvd');
  console.log('Network: Devnet');
  console.log('Deploy Signature: 28s21p9yBp1sHP2bvt5nQKkMQs136GSbo8yzZzxvBZg5wTMBiycHbitmzMzgmB16fEpprouQVdgFXJ7BnX1tRw3E');
  
  try {
    // Use Solana CLI to verify deployment
    const { spawn } = require('child_process');
    
    console.log('\nChecking program deployment...');
    
    const checkProgram = spawn('solana', [
      'program', 'show', 
      '87KQ61XNxoEcq3p1ZDaRJ1NwPHKCJpbKbeEEzkuK3rvd',
      '--url', 'devnet'
    ]);
    
    checkProgram.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
    });
    
    checkProgram.stderr.on('data', (data: Buffer) => {
      console.error('Error:', data.toString());
    });
    
    checkProgram.on('close', (code: number) => {
      if (code === 0) {
        console.log('✅ Program successfully deployed to Solana devnet');
        console.log('🎾 Ready for cross-chain ping-pong with EVM!');
      } else {
        console.log('❌ Program verification failed');
      }
    });
    
  } catch (error) {
    console.error('Error verifying program:', error);
    
    // Fallback verification info
    console.log('\n=== Manual Verification ===');
    console.log('You can manually verify the deployment by running:');
    console.log('solana program show 87KQ61XNxoEcq3p1ZDaRJ1NwPHKCJpbKbeEEzkuK3rvd --url devnet');
    console.log('\nOr check on Solana Explorer:');
    console.log('https://explorer.solana.com/address/87KQ61XNxoEcq3p1ZDaRJ1NwPHKCJpbKbeEEzkuK3rvd?cluster=devnet');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });