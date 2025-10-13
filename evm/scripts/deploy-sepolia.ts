import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("Deploying PingPongEVM to Sepolia testnet...");
  
  // LayerZero endpoint for Sepolia testnet
  const sepoliaEndpoint = "0x6EDCE65403992e310A62460808c4b910D972f10f";
  
  // Solana LayerZero EID (testnet)
  const solanaEid = 40168; // Solana devnet EID
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.01 ETH");
  }
  
  // Deploy the contract
  const PingPongEVM = await ethers.getContractFactory("PingPongEVM");
  const pingPongEVM = await PingPongEVM.deploy(sepoliaEndpoint, solanaEid, deployer.address);
  
  await pingPongEVM.waitForDeployment();
  const contractAddress = await pingPongEVM.getAddress();
  
  console.log("PingPongEVM deployed to:", contractAddress);
  console.log("LayerZero Endpoint:", sepoliaEndpoint);
  console.log("Solana Peer EID:", solanaEid);
  console.log("Owner:", deployer.address);
  
  // Wait for a few confirmations before verification
  console.log("Waiting for confirmations...");
  await pingPongEVM.deploymentTransaction()?.wait(5);
  
  // Verify the contract on Etherscan
  try {
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [sepoliaEndpoint, solanaEid, deployer.address],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error);
  }
  
  console.log("\n=== Deployment Summary ===");
  console.log("Network: Sepolia Testnet");
  console.log("Contract Address:", contractAddress);
  console.log("LayerZero Endpoint:", sepoliaEndpoint);
  console.log("Owner:", deployer.address);
  console.log("Transaction Hash:", pingPongEVM.deploymentTransaction()?.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });