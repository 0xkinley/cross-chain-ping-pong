import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;
// The Solana program ID in bytes32 format (32 bytes)
const SOLANA_PROGRAM_ID = "0xADFa4e44cE33a1EFfBba81e7DcBe58F6c8D8aF2D8e5B6A0C67F19B8FcE2e3D4F"; // This needs to be the correct format

async function main() {
  console.log("🔧 Setting EVM Peer Configuration");
  console.log("==================================");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Connect to the contract
    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    // First, let's convert the Solana Program ID to the correct format
    // Solana Program ID: Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF
    // We need to convert this base58 to bytes32
    console.log("\n🔄 Converting Solana Program ID to bytes32...");
    
    // For now, let's try to understand what format LayerZero expects
    // The peer address should be the Solana program ID in bytes32 format
    
    // Let's try with a properly formatted address
    // We need to convert the Solana program ID from base58 to hex
    const solanaProgramIdBase58 = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";
    
    // For now, let's use a placeholder and see what functions are available
    console.log("Solana Program ID (base58):", solanaProgramIdBase58);
    console.log("Solana EID:", SOLANA_EID);

    // Check if there's a setPeer function available
    console.log("\n🔍 Available functions in contract...");
    
    // Let's try to call a simple function first to ensure the contract works
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    
    // Check if we can read existing peer configuration
    try {
      const peerEid = await contract.peerEid();
      console.log("Configured peer EID:", peerEid.toString());
    } catch (error) {
      console.log("Error reading peer EID:", error);
    }

    console.log("\n💡 To set up LayerZero peers properly, we need to:");
    console.log("1. Convert the Solana Program ID to bytes32 format");
    console.log("2. Use LayerZero's setPeer function");
    console.log("3. This usually requires LayerZero SDK or proper conversion utilities");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);