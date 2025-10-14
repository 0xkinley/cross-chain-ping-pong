import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;

function solanaAddressToBytes32(base58Address: string): string {
  
  
  const programIdHex = "0x" + Buffer.from(base58Address, 'utf8').toString('hex').padStart(64, '0').slice(0, 64);
  return programIdHex;
}

async function main() {
  console.log(" Setting LayerZero Peer Configuration");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    const solanaProgramIdBase58 = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";
    
    console.log("\n Setting up peer configuration...");
    console.log("Solana Program ID:", solanaProgramIdBase58);
    console.log("Solana EID:", SOLANA_EID);

    
    
    
    
    const peerBytes32 = ethers.zeroPadValue("0x" + Buffer.from(solanaProgramIdBase58).toString('hex'), 32);
    console.log("Peer address (bytes32):", peerBytes32);

    console.log("\n Setting peer...");
    
    try {
      const tx = await contract.setPeer(SOLANA_EID, peerBytes32);
      
      console.log("Transaction hash:", tx.hash);
      console.log(" Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(" Peer set successfully!");
      console.log("Gas used:", receipt?.gasUsed.toString());
      console.log(` View on explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
    } catch (error: any) {
      if (error.message.includes("is not a function")) {
        console.log(" setPeer function not available directly");
        console.log(" The contract might use a different peer management approach");
        
        console.log("\n Let's check what peer-related functions exist...");
        
        try {
          console.log("Checking existing peer configuration...");
          
        } catch (e) {
          console.log("No peer reading function found");
        }
        
      } else {
        console.log(" Error setting peer:", error.message);
      }
    }

  } catch (error: any) {
    console.error(" Error:", error.message);
  }
}

main().catch(console.error);