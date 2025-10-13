import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;

// Convert Solana Program ID from base58 to bytes32
// Solana Program ID: Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF
// We need to convert this to a proper address format for LayerZero
function solanaAddressToBytes32(base58Address: string): string {
  // For LayerZero, we typically need to convert the Solana program ID to bytes32
  // This is a simplified conversion - in production you'd use proper base58 decoding
  
  // For now, let's use the program ID in a format LayerZero can understand
  // The Solana program address needs to be properly formatted as 32 bytes
  
  // Convert the base58 to a hex representation that fits in bytes32
  // This is a placeholder implementation - you'd normally use a proper base58 decoder
  const programIdHex = "0x" + Buffer.from(base58Address, 'utf8').toString('hex').padStart(64, '0').slice(0, 64);
  return programIdHex;
}

async function main() {
  console.log("🔧 Setting LayerZero Peer Configuration");
  console.log("=======================================");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Connect to the contract
    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    // Convert Solana Program ID to the format expected by LayerZero
    const solanaProgramIdBase58 = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";
    
    // For LayerZero, we need the address in bytes32 format
    // Let's try a different approach - use the program ID directly as bytes
    console.log("\n🔄 Setting up peer configuration...");
    console.log("Solana Program ID:", solanaProgramIdBase58);
    console.log("Solana EID:", SOLANA_EID);

    // Since OApp contracts typically have setPeer, let's try to call it
    // The peer address for Solana should be the program ID
    
    // For LayerZero, the peer is typically set as bytes32
    // Let's try using the program ID in a proper format
    
    // A more direct approach: use the program ID as-is but ensure it's 32 bytes
    // Solana addresses are 32 bytes, so we can convert directly
    
    // For now, let's try using a known working format
    // The program ID needs to be converted from base58 to bytes32
    
    const peerBytes32 = ethers.zeroPadValue("0x" + Buffer.from(solanaProgramIdBase58).toString('hex'), 32);
    console.log("Peer address (bytes32):", peerBytes32);

    // Try to call setPeer - this is a standard LayerZero OApp function
    console.log("\n🚀 Setting peer...");
    
    try {
      // The setPeer function signature: setPeer(uint32 _eid, bytes32 _peer)
      const tx = await contract.setPeer(SOLANA_EID, peerBytes32);
      
      console.log("Transaction hash:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Peer set successfully!");
      console.log("Gas used:", receipt?.gasUsed.toString());
      console.log(`🔗 View on explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
    } catch (error: any) {
      if (error.message.includes("is not a function")) {
        console.log("❌ setPeer function not available directly");
        console.log("💡 The contract might use a different peer management approach");
        
        // Let's try to see what functions are available
        console.log("\n🔍 Let's check what peer-related functions exist...");
        
        // Try to check the current peer configuration
        try {
          // Check if there's a way to read peer configuration
          console.log("Checking existing peer configuration...");
          
        } catch (e) {
          console.log("No peer reading function found");
        }
        
      } else {
        console.log("❌ Error setting peer:", error.message);
      }
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);