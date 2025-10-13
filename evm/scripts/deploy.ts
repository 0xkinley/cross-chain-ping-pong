import { ethers, network } from "hardhat";
import { PingPongEVM } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying PingPongEVM contract to", network.name);
  console.log("==================================================");

  // Network-specific configuration
  let LZ_ENDPOINT: string;
  let SOLANA_EID: number;
  
  if (network.name === "sepolia") {
    LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";
    SOLANA_EID = 40168; // LayerZero endpoint ID for Solana devnet
    console.log("📡 Network: Sepolia Testnet");
    console.log("🔗 Solana Target: Devnet");
  } else if (network.name === "localhost" || network.name === "hardhat") {
    // For local testing, use mock addresses
    LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";
    SOLANA_EID = 40168;
    console.log("🧪 Network: Local/Hardhat");
  } else {
    throw new Error(`Unsupported network: ${network.name}`);
  }
  
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  console.log("🌐 LayerZero Endpoint:", LZ_ENDPOINT);
  console.log("🎯 Peer EID (Solana):", SOLANA_EID);
  
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.1 ETH.");
  }

  console.log("\n📦 Deploying PingPongEVM...");
  
  // Deploy PingPongEVM
  const PingPongEVMFactory = await ethers.getContractFactory("PingPongEVM");
  const pingPongEVM = await PingPongEVMFactory.deploy(
    LZ_ENDPOINT,      // LayerZero endpoint
    SOLANA_EID,       // Peer endpoint ID (Solana)
    deployer.address  // Owner
  ) as PingPongEVM;

  await pingPongEVM.waitForDeployment();
  const contractAddress = await pingPongEVM.getAddress();

  console.log("✅ PingPongEVM deployed to:", contractAddress);
  console.log("🌐 LayerZero Endpoint:", LZ_ENDPOINT);
  console.log("🎯 Peer EID (Solana):", SOLANA_EID);
  console.log("👤 Owner:", deployer.address);

  // Fund the contract for LayerZero fees
  const fundAmount = ethers.parseEther("0.05");
  console.log("\n💰 Funding contract with", ethers.formatEther(fundAmount), "ETH for LayerZero fees...");
  
  try {
    const fundTx = await pingPongEVM.fund({ value: fundAmount });
    await fundTx.wait();
    console.log("✅ Contract funded successfully");
  } catch (error) {
    console.log("⚠️  Contract funding failed, but deployment succeeded");
    console.log("💡 You can fund it manually later with the fund() function");
  }
  
  const contractBalance = await ethers.provider.getBalance(contractAddress);
  console.log("💳 Contract balance:", ethers.formatEther(contractBalance), "ETH");

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    layerZeroEndpoint: LZ_ENDPOINT,
    peerEid: SOLANA_EID,
    owner: deployer.address,
    network: network.name,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 === Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file for reference
  const fs = require('fs');
  const deploymentFile = `deployment-${network.name}-${Date.now()}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  
  // Next steps
  console.log("\n🚀 === Next Steps ===");
  console.log("1. ✅ EVM contract deployed to", network.name);
  console.log("2. 🔄 Deploy Solana program to devnet");
  console.log("3. 🔗 Configure peer addresses on both sides");
  console.log("4. 🎮 Test cross-chain ping-pong game");
  console.log("\n📱 Contract Address:", contractAddress);
  console.log(`🔍 Etherscan: https://${network.name}.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });