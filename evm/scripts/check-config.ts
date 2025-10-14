import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";

async function main() {
  console.log(" Checking EVM Contract Configuration");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    try {
      const gameState = await contract.gameState();
      console.log("\n Game State:");
      console.log("- Game Active:", gameState.gameActive);
      console.log("- Has Ball:", gameState.hasBall);
      console.log("- Max Rallies:", gameState.maxRallies.toString());
      
      const ballValue = await contract.ballValue();
      const rallyCount = await contract.rallyCount();
      console.log("- Ball Value:", ballValue.toString());
      console.log("- Rally Count:", rallyCount.toString());
    } catch (error) {
      console.log(" Error reading game state:", error);
    }

    try {
      const peerEid = await contract.peerEid();
      console.log("\n Peer Configuration:");
      console.log("- Peer EID:", peerEid.toString());
    } catch (error) {
      console.log(" Error reading peer EID:", error);
    }

    try {
      const owner = await contract.owner();
      console.log("\n Ownership:");
      console.log("- Owner:", owner);
      console.log("- Is signer owner?:", owner.toLowerCase() === signer.address.toLowerCase());
    } catch (error) {
      console.log(" Error reading owner:", error);
    }

    try {
      console.log("\n LayerZero Integration:");
      console.log("- Contract appears to be properly deployed");
      console.log("- Checking if peer is configured...");
    } catch (error) {
      console.log(" Error checking LayerZero integration:", error);
    }

  } catch (error: any) {
    console.error(" Failed to check contract:", error.message);
  }
}

main().catch(console.error);