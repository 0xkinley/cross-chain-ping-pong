import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";

async function main() {
  console.log(" Simple Serve Test (without LayerZero)");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    console.log("Balance:", ethers.formatEther(await signer.provider.getBalance(signer.address)), "ETH");

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    const gameState = await contract.gameState();
    console.log("\n Current Game State:");
    console.log("- Game Active:", gameState.gameActive);
    console.log("- Has Ball:", gameState.hasBall);
    console.log("- Max Rallies:", gameState.maxRallies.toString());

    if (gameState.gameActive) {
      console.log(" Game is already active!");
      return;
    }

    console.log("\n Testing quote function...");
    const ballValue = ethers.parseUnits("100", 18);
    const rallyCount = 0;
    const options = "0x";
    
    try {
      const fee = await contract.quote(ballValue, rallyCount, options, false);
      console.log(" Quote successful!");
      console.log("Native fee:", ethers.formatEther(fee.nativeFee), "ETH");
      console.log("LZ token fee:", fee.lzTokenFee.toString());
      
      const maxRallies = 100;
      const feeWithBuffer = (fee.nativeFee * 110n) / 100n;
      
      console.log("\n Attempting to serve with fee:", ethers.formatEther(feeWithBuffer), "ETH");
      
      const tx = await contract.serve(maxRallies, options, {
        value: feeWithBuffer,
        gasLimit: 1000000
      });
      
      console.log("Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log(" Serve successful!");
      console.log("Gas used:", receipt?.gasUsed.toString());
      
    } catch (quoteError: any) {
      console.log(" Quote failed:", quoteError.message);
      
      if (quoteError.message.includes("execution reverted")) {
        console.log("\n The contract reverted. This might be due to:");
        console.log("1. Missing peer configuration in LayerZero");
        console.log("2. Invalid message format");
        console.log("3. LayerZero endpoint issues");
        
        try {
          const owner = await contract.owner();
          const peerEid = await contract.peerEid();
          console.log("\n Contract Info:");
          console.log("- Owner:", owner);
          console.log("- Peer EID:", peerEid.toString());
          
        } catch (e) {
          console.log("Could not read additional contract info");
        }
      }
    }

  } catch (error: any) {
    console.error(" Error:", error.message);
  }
}

main().catch(console.error);