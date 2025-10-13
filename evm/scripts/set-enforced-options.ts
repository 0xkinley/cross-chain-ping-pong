import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;

async function main() {
  console.log("🔧 Setting LayerZero Enforced Options");
  console.log("=====================================");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Connect to the contract
    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    // LayerZero often requires enforced options to be set
    // Let's try to set enforced options for the peer
    console.log("\n🚀 Setting enforced options...");

    try {
      // Try to set enforced options - this is a common LayerZero requirement
      // The function signature is typically: setEnforcedOptions(EnforcedOptionParam[] calldata _enforcedOptions)
      
      // First, let's create minimal enforced options
      const msgType = 1; // SEND_BALL constant from contract
      const options = "0x0003010011010000000000000000000000000000ea60"; // Basic execution options
      
      // EnforcedOptionParam structure: { eid: uint32, msgType: uint16, options: bytes }
      const enforcedOptionParam = {
        eid: SOLANA_EID,
        msgType: msgType,
        options: options
      };

      const tx = await contract.setEnforcedOptions([enforcedOptionParam]);
      
      console.log("Transaction hash:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Enforced options set successfully!");
      console.log("Gas used:", receipt?.gasUsed.toString());
      console.log(`🔗 View on explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
      
      // Now test the quote function
      console.log("\n💰 Testing quote after setting enforced options...");
      const ballValue = ethers.parseUnits("100", 18);
      const rallyCount = 0;
      const testOptions = "0x";
      
      try {
        const fee = await contract.quote(ballValue, rallyCount, testOptions, false);
        console.log("✅ Quote successful after enforced options!");
        console.log("Native fee:", ethers.formatEther(fee.nativeFee), "ETH");
        console.log("LZ token fee:", fee.lzTokenFee.toString());
        
        console.log("\n🎉 LayerZero is now properly configured!");
        console.log("🎾 You can now run the serve script to start the game!");
        
      } catch (quoteError: any) {
        console.log("❌ Quote still failing:", quoteError.message);
        console.log("Revert data:", quoteError.data);
      }
      
    } catch (enforcedOptionsError: any) {
      console.log("❌ Error setting enforced options:", enforcedOptionsError.message);
      
      if (enforcedOptionsError.message.includes("is not a function")) {
        console.log("💡 setEnforcedOptions function not available");
        console.log("📝 Trying alternative approach...");
        
        // Maybe the contract uses a different function name
        console.log("💡 Trying manual LayerZero configuration...");
        console.log("This might require direct endpoint interaction");
      }
    }

    // Let's also try to see what the error code means
    console.log("\n🔍 Error Analysis:");
    console.log("Error data from previous attempt: 0x6592671c0000000000000000000000000000000000000000000000000000000000000000");
    console.log("This might be a LayerZero specific error code");
    console.log("Common LayerZero errors:");
    console.log("- NoPeer: Peer not configured");
    console.log("- InvalidOptions: Options format invalid");
    console.log("- InsufficientGas: Gas limit too low in options");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);