import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";
import bs58 from "bs58";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;
const SOLANA_PROGRAM_ID = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";

async function main() {
  console.log(" Setting LayerZero Peer (Proper Method)");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    console.log("\n Converting Solana Program ID...");
    console.log("Solana Program ID (base58):", SOLANA_PROGRAM_ID);
    
    const programIdBytes = bs58.decode(SOLANA_PROGRAM_ID);
    console.log("Program ID bytes length:", programIdBytes.length);
    console.log("Program ID bytes:", Buffer.from(programIdBytes).toString('hex'));
    
    const peerAddress = "0x" + Buffer.from(programIdBytes).toString('hex');
    console.log("Peer address (hex):", peerAddress);
    
    const peerBytes32 = ethers.zeroPadValue(peerAddress, 32);
    console.log("Peer address (bytes32):", peerBytes32);

    console.log("\n Setting peer configuration...");
    console.log("Target EID:", SOLANA_EID);
    console.log("Peer Address:", peerBytes32);

    try {
      const tx = await contract.setPeer(SOLANA_EID, peerBytes32);
      
      console.log("Transaction hash:", tx.hash);
      console.log(" Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(" Peer set successfully!");
      console.log("Gas used:", receipt?.gasUsed.toString());
      console.log(` View on explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);

      console.log("\n Testing quote after peer setup...");
      const ballValue = ethers.parseUnits("100", 18);
      const rallyCount = 0;
      const options = "0x";
      
      try {
        const fee = await contract.quote(ballValue, rallyCount, options, false);
        console.log(" Quote successful after peer setup!");
        console.log("Native fee:", ethers.formatEther(fee.nativeFee), "ETH");
        console.log("LZ token fee:", fee.lzTokenFee.toString());
        
        console.log("\n LayerZero peer configuration complete!");
        console.log(" You can now run the serve script to start the game!");
        
      } catch (quoteError: any) {
        console.log(" Quote still failing:", quoteError.message);
      }
      
    } catch (setPeerError: any) {
      console.log(" Error setting peer:", setPeerError.message);
      
      if (setPeerError.message.includes("is not a function")) {
        console.log(" setPeer function not directly available");
        console.log(" This might require LayerZero SDK or different approach");
      } else if (setPeerError.message.includes("Ownable: caller is not the owner")) {
        console.log(" Only the contract owner can set peers");
      }
    }

  } catch (error: any) {
    console.error(" Error:", error.message);
  }
}

main().catch(console.error);