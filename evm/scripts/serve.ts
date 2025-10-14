import { ethers } from "hardhat";

async function main() {
  console.log(" Initializing Cross-Chain Ping-Pong Game");
  
  const contractAddress = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
  
  const [signer] = await ethers.getSigners();
  const PingPongEVM = await ethers.getContractFactory("PingPongEVM");
  const contract = PingPongEVM.attach(contractAddress).connect(signer) as any;
  
  console.log("Signer address:", await signer.getAddress());
  console.log("Contract address:", contractAddress);
  
  try {
    const gameState = await contract.gameState();
    console.log("\nCurrent game state:");
    console.log("Game Active:", gameState.gameActive);
    console.log("Has Ball:", gameState.hasBall);
    
    if (gameState.gameActive) {
      console.log(" Game is already active!");
      const ballValue = await contract.ballValue();
      const rallyCount = await contract.rallyCount();
      console.log("Current ball value:", ballValue.toString());
      console.log("Current rally count:", rallyCount.toString());
      return;
    }
    
    console.log("\n Getting LayerZero fee quote...");
    const options = "0x";
    const payInLzToken = false;
    
    const initialBallValue = ethers.parseEther("100");
    const initialRallyCount = 0n;
    
    const quote = await contract.quote(initialBallValue, initialRallyCount, options, payInLzToken);
    const nativeFee = quote.nativeFee;
    console.log("LayerZero fee:", ethers.formatEther(nativeFee), "ETH");
    
    
    const balance = await signer.provider.getBalance(await signer.getAddress());
    console.log("Signer balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < nativeFee) {
      console.error(" Insufficient balance for LayerZero fee!");
      console.error(`Need: ${ethers.formatEther(nativeFee)} ETH`);
      console.error(`Have: ${ethers.formatEther(balance)} ETH`);
      return;
    }
    
    console.log("\n Serving the ball...");
    console.log("This will initialize the game and send the first ball to Solana");
    
    const maxRallies = 100;
    const tx = await contract.serve(maxRallies, options, {
      value: nativeFee,
      gasLimit: 500000
    });
    
    console.log("Transaction submitted:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt?.status === 1) {
      console.log(" Game initialized successfully!");
      console.log(" Transaction:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
      
      const newGameState = await contract.gameState();
      const ballValue = await contract.ballValue();
      const rallyCount = await contract.rallyCount();
      
      console.log("\n Game State After Initialization:");
      console.log("Game Active:", newGameState.gameActive);
      console.log("Has Ball:", newGameState.hasBall);
      console.log("Ball Value:", ballValue.toString());
      console.log("Rally Count:", rallyCount.toString());
      console.log("Max Rallies:", newGameState.maxRallies.toString());
      
      console.log("\n Cross-chain ping-pong game started!");
      console.log("The ball has been sent to Solana. Watch the relayers!");
      
    } else {
      console.error(" Transaction failed!");
    }
    
  } catch (error: any) {
    console.error(" Error:", error.message);
    
    if (error.message.includes("Game already active")) {
      console.log(" Game is already running. Check the current state.");
    } else if (error.message.includes("insufficient funds")) {
      console.log(" Need more ETH for gas + LayerZero fees");
    }
  }
}

main().catch(console.error);