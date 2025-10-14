import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;
const SOLANA_PROGRAM_ID = "0xADFa4e44cE33a1EFfBba81e7DcBe58F6c8D8aF2D8e5B6A0C67F19B8FcE2e3D4F";

async function main() {
  console.log(" Setting EVM Peer Configuration");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    console.log("\n Converting Solana Program ID to bytes32...");
    
    
    const solanaProgramIdBase58 = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";
    
    console.log("Solana Program ID (base58):", solanaProgramIdBase58);
    console.log("Solana EID:", SOLANA_EID);

    console.log("\n Available functions in contract...");
    
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    
    try {
      const peerEid = await contract.peerEid();
      console.log("Configured peer EID:", peerEid.toString());
    } catch (error) {
      console.log("Error reading peer EID:", error);
    }

    console.log("\n To set up LayerZero peers properly, we need to:");
    console.log("1. Convert the Solana Program ID to bytes32 format");
    console.log("2. Use LayerZero's setPeer function");
    console.log("3. This usually requires LayerZero SDK or proper conversion utilities");
    
  } catch (error: any) {
    console.error(" Error:", error.message);
  }
}

main().catch(console.error);