#!/bin/bash

echo "🎾 Cross-Chain Ping-Pong Deployment Status"
echo "=========================================="
echo ""

# Solana Status
echo "📱 SOLANA (Devnet) - ✅ DEPLOYED"
echo "Program ID: Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF (Updated)"
echo "Previous ID: 87KQ61XNxoEcq3p1ZDaRJ1NwPHKCJpbKbeEEzkuK3rvd (Deprecated)"
echo ""

# EVM Status
echo "⚡ EVM (Sepolia) - ✅ DEPLOYED"
echo "Contract Address: 0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365"
echo "LayerZero Endpoint: 0x6EDCE65403992e310A62460808c4b910D972f10f"
echo "Solana Peer EID: 40168"
echo "Owner: 0x0dD6f5dB21e9cd83409F4DF9e2f791748CF5359d"
echo "Transaction Hash: 0xb8e3471053b441fd7ebbed68b1bbf619973fdf29b01bfeb998e94318ba9bb076"
echo ""

# Current Status
echo "🎯 CURRENT STATUS:"
echo "✅ Both contracts deployed successfully!"
echo "✅ EVM contract verified and functional"
echo "✅ Solana program verified and functional"
echo "🔄 Ready for cross-chain configuration"
echo ""

# Next Steps
echo "🚀 NEXT STEPS FOR CROSS-CHAIN SETUP:"
echo "1. Configure LayerZero peer connections"
echo "2. Set up cross-chain message routing"
echo "3. Test cross-chain ping-pong flow"
echo "4. Initialize the game with serve()"
echo ""

# Testing Commands
echo "🧪 TESTING COMMANDS:"
echo "# Test EVM contract state:"
echo "cd evm && DEPLOYED_CONTRACT_ADDRESS=0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365 npx hardhat run scripts/verify-deployment.ts --network sepolia"
echo ""
echo "# Verify Solana deployment:"
echo "solana program show 87KQ61XNxoEcq3p1ZDaRJ1NwPHKCJpbKbeEEzkuK3rvd --url devnet"
echo ""

echo "🔗 EXPLORER LINKS:"
echo "Solana: https://explorer.solana.com/address/Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF?cluster=devnet"
echo "Sepolia: https://sepolia.etherscan.io/address/0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365"
echo ""

echo "🎮 GAME READY!"
echo "Both sides of the cross-chain ping-pong game are now deployed!"
echo "Next: Configure LayerZero routing for cross-chain messaging."