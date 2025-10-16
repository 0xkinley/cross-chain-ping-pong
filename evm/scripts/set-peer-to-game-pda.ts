import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";
import bs58 from "bs58";

const CONTRACT_ADDRESS = "0x7271592d027fc1055F7E13f8947a1D5CBc8Aed10";
const SOLANA_EID = 40168;
const SOLANA_PROGRAM_ID = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";

async function main() {
  console.log("Setting LayerZero Peer to Solana Program ID");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    console.log("\nConverting Solana Program ID to peer address...");
    console.log("Solana Program ID (base58):", SOLANA_PROGRAM_ID);
    
    const programIdBytes = bs58.decode(SOLANA_PROGRAM_ID);
    console.log("Program ID bytes length:", programIdBytes.length);
    console.log("Program ID bytes:", Buffer.from(programIdBytes).toString('hex'));
    
    const peerAddress = "0x" + Buffer.from(programIdBytes).toString('hex');
    console.log("Peer address (hex):", peerAddress);
    
    const peerBytes32 = ethers.zeroPadValue(peerAddress, 32);
    console.log("Peer address (bytes32):", peerBytes32);

    console.log("\nChecking current peer configuration...");
    try {
      const currentPeer = await contract.peers(SOLANA_EID);
      console.log("Current peer:", currentPeer);
    } catch (error) {
      console.log("Could not fetch current peer:", error);
    }

    console.log("\nSetting new peer configuration...");
    console.log("Target EID:", SOLANA_EID);
    console.log("New Peer Address (Program ID):", peerBytes32);

    const tx = await contract.setPeer(SOLANA_EID, peerBytes32);
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Peer set successfully!");
    console.log("Gas used:", receipt?.gasUsed.toString());
    console.log(`View on explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);

    console.log("\nVerifying new peer configuration...");
    const newPeer = await contract.peers(SOLANA_EID);
    console.log("New peer address:", newPeer);
    
    if (newPeer.toLowerCase() === peerBytes32.toLowerCase()) {
      console.log("✅ Peer successfully set to Solana Program ID!");
    } else {
      console.log("❌ Peer configuration failed!");
    }

  } catch (error) {
    console.error("Error setting peer:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });