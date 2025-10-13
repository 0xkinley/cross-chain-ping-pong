import { ethers } from "hardhat";

async function main() {
  // You'll need to update this with your actual deployed contract address
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS || "0x...";
  
  if (contractAddress === "0x...") {
    console.log("Please set DEPLOYED_CONTRACT_ADDRESS environment variable");
    return;
  }
  
  console.log("Verifying deployed PingPongEVM contract...");
  console.log("Contract address:", contractAddress);
  
  // Connect to the deployed contract
  const PingPongEVM = await ethers.getContractFactory("PingPongEVM");
  const contract = PingPongEVM.attach(contractAddress) as any;
  
  try {
    // Read contract state
    const ballValue = await contract.ballValue();
    const rallyCount = await contract.rallyCount();
    const peerEid = await contract.peerEid();
    const owner = await contract.owner();
    
    console.log("\n=== Contract State ===");
    console.log("Ball Value:", ballValue.toString());
    console.log("Rally Count:", rallyCount.toString());
    console.log("Peer EID:", peerEid.toString());
    console.log("Owner:", owner);
    
    // Check if game is already initialized
    const isInitialized = ballValue > 0n;
    console.log("Game Initialized:", isInitialized);
    
    if (!isInitialized) {
      console.log("\n🎾 Game is ready to be served!");
      console.log("Call serve() to start the ping-pong game");
    } else {
      console.log("\n🎾 Game is in progress!");
      console.log(`Current ball value: ${ballValue}`);
      console.log(`Rally count: ${rallyCount}`);
    }
    
  } catch (error) {
    console.error("Error reading contract state:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });