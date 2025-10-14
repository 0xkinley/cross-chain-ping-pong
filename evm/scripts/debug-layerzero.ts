import { ethers } from "hardhat";
import { PingPongEVM } from "../typechain-types";

const CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;

async function main() {
  console.log(" LayerZero Configuration Debug");

  try {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    const contract = await ethers.getContractAt("PingPongEVM", CONTRACT_ADDRESS) as PingPongEVM;
    console.log("Contract address:", CONTRACT_ADDRESS);

    console.log("\n Diagnosing LayerZero configuration...");
    
    try {
      console.log("Checking LayerZero endpoint integration...");
      
      const endpointInterface = new ethers.Interface([
        "function endpoint() external view returns (address)"
      ]);
      
      try {
        const endpointAddress = await contract.endpoint();
        console.log(" Endpoint address:", endpointAddress);
        
        const endpointInterface = new ethers.Interface([
          "function delegates(address oapp) external view returns (address)",
          "function isValidReceiveLibrary(address oapp, uint32 eid) external view returns (bool)"
        ]);
        
        const endpoint = new ethers.Contract(endpointAddress, endpointInterface, signer);
        
        try {
          const delegate = await endpoint.delegates(CONTRACT_ADDRESS);
          console.log(" Delegate address:", delegate);
        } catch (e: any) {
          console.log("  Could not read delegate:", e.message);
        }
        
      } catch (e: any) {
        console.log(" Could not get endpoint:", e.message);
      }
      
      try {
        console.log("\n Checking peer configuration...");
        
        const peerInterface = new ethers.Interface([
          "function peers(uint32 eid) external view returns (bytes32)"
        ]);
        
        const peerData = await contract.peers(SOLANA_EID);
        console.log(" Peer configured for EID", SOLANA_EID, ":", peerData);
        
        if (peerData === "0x0000000000000000000000000000000000000000000000000000000000000000") {
          console.log("  Peer is not set (zero bytes)");
        } else {
          console.log(" Peer is properly configured");
        }
        
      } catch (e: any) {
        console.log(" Could not read peer configuration:", e.message);
      }
      
      console.log("\n Testing quote with minimal options...");
      
      try {
        const ballValue = 1n;
        const rallyCount = 0n;
        const options = "0x";
        
        const messageInterface = new ethers.Interface([
          "function _encodeMessage(uint256 _ballValue, uint256 _rallyCount) external pure returns (bytes)"
        ]);
        
        const fee = await contract.quote(ballValue, rallyCount, options, false);
        console.log(" Quote successful with minimal values!");
        console.log("Native fee:", ethers.formatEther(fee.nativeFee), "ETH");
        
      } catch (quoteError: any) {
        console.log(" Quote failed even with minimal values:", quoteError.message);
        
        if (quoteError.data) {
          console.log("Revert data:", quoteError.data);
        }
        
        try {
          const errorInterface = new ethers.Interface([
            "error NoPeer(uint32 eid)",
            "error InvalidEndpointCall()",
            "error OnlyEndpoint(address addr)"
          ]);
          
          if (quoteError.data) {
            const decodedError = errorInterface.parseError(quoteError.data);
            console.log("Decoded error:", decodedError);
          }
        } catch (e) {
        }
      }
      
    } catch (diagError: any) {
      console.log(" Diagnosis failed:", diagError.message);
    }

    console.log("\n Next steps to try:");
    console.log("1. Verify LayerZero endpoint is properly configured");
    console.log("2. Check if enforced options need to be set");
    console.log("3. Ensure both EVM and Solana sides have proper peer configuration");
    console.log("4. Consider using LayerZero CLI or SDK for proper setup");

  } catch (error: any) {
    console.error(" Error:", error.message);
  }
}

main().catch(console.error);