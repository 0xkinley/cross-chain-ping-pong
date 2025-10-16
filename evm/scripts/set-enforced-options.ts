import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x7271592d027fc1055F7E13f8947a1D5CBc8Aed10";
const SOLANA_EID = 40168;

async function main() {
  console.log(" Setting LayerZero Enforced Options");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    console.log("\n Setting enforced options...");

    try {
      
      const msgType = 1;
      const options = "0x0003010011010000000000000000000000000000ea60";
      
      const enforcedOptionParam = {
        eid: SOLANA_EID,
        msgType: msgType,
        options: options
      };

      const tx = await contract.setEnforcedOptions([enforcedOptionParam]);
      
      console.log("Transaction hash:", tx.hash);
      console.log(" Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(" Enforced options set successfully!");
      console.log("Gas used:", receipt?.gasUsed.toString());
      console.log(` View on explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
      console.log("\n Testing quote after setting enforced options...");
      const ballValue = ethers.parseUnits("100", 18);
      const rallyCount = 0;
      const testOptions = "0x";
      
      try {
        const fee = await contract.quote(ballValue, rallyCount, testOptions, false);
        console.log(" Quote successful after enforced options!");
        console.log("Native fee:", ethers.formatEther(fee.nativeFee), "ETH");
        console.log("LZ token fee:", fee.lzTokenFee.toString());
        
        console.log("\n LayerZero is now properly configured!");
        console.log(" You can now run the serve script to start the game!");
        
      } catch (quoteError: any) {
        console.log(" Quote still failing:", quoteError.message);
        console.log("Revert data:", quoteError.data);
      }
      
    } catch (enforcedOptionsError: any) {
      console.log(" Error setting enforced options:", enforcedOptionsError.message);
      
      if (enforcedOptionsError.message.includes("is not a function")) {
        console.log(" setEnforcedOptions function not available");
        console.log(" Trying alternative approach...");
        
        console.log(" Trying manual LayerZero configuration...");
        console.log("This might require direct endpoint interaction");
      }
    }

    console.log("\n Error Analysis:");
    console.log("Error data from previous attempt: 0x6592671c0000000000000000000000000000000000000000000000000000000000000000");
    console.log("This might be a LayerZero specific error code");
    console.log("Common LayerZero errors:");
    console.log("- NoPeer: Peer not configured");
    console.log("- InvalidOptions: Options format invalid");
    console.log("- InsufficientGas: Gas limit too low in options");

  } catch (error: any) {
    console.error(" Error:", error.message);
  }
}

main().catch(console.error);