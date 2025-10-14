import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";
import bs58 from "bs58";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;
const SOLANA_GAME_PDA = "Dz5yBVXHez3vQ8uypCReiX6ufLtvNcLfdrp5hAGxJLHv";

async function main() {
  console.log("Setting LayerZero Peer to Game PDA");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    console.log("\nConverting Solana Game PDA to peer address...");
    console.log("Solana Game PDA (base58):", SOLANA_GAME_PDA);
    
    const gamePDABytes = bs58.decode(SOLANA_GAME_PDA);
    console.log("Game PDA bytes length:", gamePDABytes.length);
    console.log("Game PDA bytes:", Buffer.from(gamePDABytes).toString('hex'));
    
    const peerAddress = "0x" + Buffer.from(gamePDABytes).toString('hex');
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
    console.log("New Peer Address (Game PDA):", peerBytes32);

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
      console.log("✅ Peer successfully set to Game PDA!");
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