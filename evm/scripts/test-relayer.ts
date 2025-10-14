import { ethers } from "hardhat";


const EVM_CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;

async function testEVMRelayer() {
  console.log(" Testing EVM Cross-Chain Relayer Configuration");
  
  try {
    const provider = ethers.provider;
    const [signer] = await ethers.getSigners();
    
    console.log(" Connected to Sepolia testnet");
    console.log(" Signer address:", await signer.getAddress());
    
    const balance = await provider.getBalance(await signer.getAddress());
    console.log(" Signer balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.001")) {
      console.warn("  Low balance - may need more ETH for LayerZero fees");
    }
    
    const PingPongEVM = await ethers.getContractFactory("PingPongEVM");
    const contract = PingPongEVM.attach(EVM_CONTRACT_ADDRESS).connect(signer) as any;
    
    const code = await provider.getCode(EVM_CONTRACT_ADDRESS);
    if (code === "0x") {
      console.error(" No contract found at address!");
      return;
    }
    console.log(" Contract found at address");
    
    const [ballValue, rallyCount, gameState, owner, peerEid] = await Promise.all([
      contract.ballValue(),
      contract.rallyCount(),
      contract.gameState(),
      contract.owner(),
      contract.peerEid(),
    ]);
    
    console.log("\n Contract State:");
    console.log("Ball Value:", ballValue.toString());
    console.log("Rally Count:", rallyCount.toString());
    console.log("Game Active:", gameState.gameActive);
    console.log("Has Ball:", gameState.hasBall);
    console.log("Max Rallies:", gameState.maxRallies.toString());
    console.log("Owner:", owner);
    console.log("Peer EID:", peerEid.toString());
    
    const isInitialized = gameState.gameActive;
    console.log("Game Initialized:", isInitialized);
    
    if (!isInitialized) {
      console.log("\n Game is ready to be served!");
      console.log("Call serve() to start the ping-pong game");
      
        try {
          console.log("\n Testing LayerZero fee quote...");
          const options = "0x";
          const payInLzToken = false;
          const quote = await contract.quote(1000n, 1n, options, payInLzToken);
          const nativeFee = quote.nativeFee;
          console.log(" LayerZero fee quote:", ethers.formatEther(nativeFee), "ETH");        if (balance >= nativeFee) {
          console.log(" Sufficient balance for cross-chain message");
        } else {
          console.warn("  Insufficient balance for cross-chain message");
        }
      } catch (error: any) {
        console.warn("  Fee quote failed:", error.message);
      }
    } else {
      console.log("\n Game is in progress!");
      console.log(`Current ball value: ${ballValue}`);
      console.log(`Rally count: ${rallyCount}`);
    }
    
    console.log("\n Configuration Summary:");
    console.log("Contract Address:", EVM_CONTRACT_ADDRESS);
    console.log("Solana EID:", SOLANA_EID);
    console.log("Network: Sepolia Testnet");
    console.log("Signer:", await signer.getAddress());
    
    console.log("\n Next Steps:");
    if (!isInitialized) {
      console.log("1. Call serve() to initialize the game");
      console.log("2. Run the EVM relayer to monitor and forward messages");
    } else {
      console.log("1. Run the EVM relayer to monitor game state");
      console.log("2. Check Solana side for cross-chain messages");
    }
    
    console.log("\n EVM relayer configuration test completed successfully!");
    
  } catch (error: any) {
    console.error(" Error during EVM relayer test:", error.message);
    
    if (error.message.includes("network")) {
      console.error(" Check your network connection and RPC URL");
    } else if (error.message.includes("insufficient funds")) {
      console.error(" Fund your wallet with Sepolia ETH");
    }
  }
}

testEVMRelayer().catch(console.error);