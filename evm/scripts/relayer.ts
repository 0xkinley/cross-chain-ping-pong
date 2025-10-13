import { ethers } from "hardhat";
import { Contract, EventLog, Provider, Signer } from "ethers";

// Configuration - Updated with deployed addresses
const EVM_CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168; // Solana devnet EID
const CHECK_INTERVAL = 3000; // Check every 3 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds between retries

interface GameStateStruct {
  maxRallies: bigint;
  hasBall: boolean;
  gameActive: boolean;
}

interface ContractState {
  ballValue: bigint;
  rallyCount: bigint;
  gameState: GameStateStruct;
}

class EVMRelayer {
  private contract: any;
  private provider: Provider;
  private signer: Signer;
  private isRunning: boolean = false;
  private retryCount: number = 0;
  private lastProcessedBlock: number = 0;

  constructor(contract: any, provider: Provider, signer: Signer) {
    this.contract = contract;
    this.provider = provider;
    this.signer = signer;
  }

  async start() {
    console.log("🤖 EVM Relayer starting...");
    console.log("Contract Address:", EVM_CONTRACT_ADDRESS);
    console.log("Solana EID:", SOLANA_EID);
    console.log("Check interval:", CHECK_INTERVAL, "ms\n");

    this.isRunning = true;

    // Get current block number
    this.lastProcessedBlock = await this.provider.getBlockNumber();
    console.log("Starting from block:", this.lastProcessedBlock);

    // Initial state check
    await this.checkGameState();

    // Main loop
    while (this.isRunning) {
      try {
        await this.checkGameState();
        await this.checkForEvents();
        this.retryCount = 0; // Reset retry count on success
      } catch (error: any) {
        console.error("❌ Error in relayer loop:", error.message);
        this.retryCount++;

        if (this.retryCount >= MAX_RETRIES) {
          console.error(`⚠️  Max retries (${MAX_RETRIES}) reached. Waiting ${RETRY_DELAY}ms before continuing...`);
          await this.sleep(RETRY_DELAY);
          this.retryCount = 0;
        }
      }

      // Wait before next check
      await this.sleep(CHECK_INTERVAL);
    }
  }

  async checkGameState() {
    try {
      const [ballValue, rallyCount, gameState] = await Promise.all([
        this.contract.ballValue(),
        this.contract.rallyCount(),
        this.contract.gameState(),
      ]);

      const contractState: ContractState = {
        ballValue,
        rallyCount,
        gameState,
      };

      // Log current state (optional, comment out for less verbose logs)
      this.logGameState(contractState);

      // Check if we need to send the ball
      if (this.shouldSendBall(contractState)) {
        await this.sendBall(contractState);
      }
    } catch (error: any) {
      if (!error.message.includes("call revert exception")) {
        throw error;
      }
    }
  }

  async checkForEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      
      if (currentBlock <= this.lastProcessedBlock) {
        return; // No new blocks
      }

      // Query for BallReceived events in new blocks
      const filter = this.contract.filters.BallReceived();
      const events = await this.contract.queryFilter(
        filter,
        this.lastProcessedBlock + 1,
        currentBlock
      );

      if (events.length > 0) {
        console.log(`\n🔔 Found ${events.length} BallReceived event(s) in blocks ${this.lastProcessedBlock + 1}-${currentBlock}`);
        
        for (const event of events) {
          if (event instanceof EventLog) {
            console.log(`   📨 Ball received from Solana:`);
            console.log(`      Value: ${event.args[0]}`);
            console.log(`      Rally: ${event.args[1]}`);
            console.log(`      Block: ${event.blockNumber}`);
            console.log(`      TX: ${event.transactionHash}`);
          }
        }
      }

      this.lastProcessedBlock = currentBlock;
    } catch (error: any) {
      console.error("Error checking events:", error.message);
    }
  }

  shouldSendBall(contractState: ContractState): boolean {
    // The EVM contract handles ball sending automatically
    // This relayer is mainly for monitoring, not sending
    // Only return true if we need manual intervention
    return false; // Disabled for now - EVM handles this automatically
  }

  async sendBall(contractState: ContractState) {
    const ballValue = contractState.ballValue;
    const rallyCount = contractState.rallyCount;

    console.log(`\n🏓 Ball ready to send!`);
    console.log(`   Value: ${ballValue.toString()}`);
    console.log(`   Rally: ${rallyCount.toString()}`);

    try {
      // Step 1: Get quote for LayerZero fee
      console.log("   💰 Getting LayerZero fee quote...");
      
      const options = "0x"; // Empty options for now
      const payInLzToken = false; // Pay in native token (ETH)
      const quote = await this.contract.quote(ballValue, rallyCount, options, payInLzToken);
      const nativeFee = quote.nativeFee; // nativeFee from the MessagingFee struct

      console.log(`   💰 LayerZero fee: ${ethers.formatEther(nativeFee)} ETH`);

      // Step 2: Check signer balance
      const balance = await this.provider.getBalance(await this.signer.getAddress());
      console.log(`   💼 Signer balance: ${ethers.formatEther(balance)} ETH`);

      if (balance < nativeFee) {
        console.error(`   ⚠️  Insufficient balance! Need ${ethers.formatEther(nativeFee)} ETH, have ${ethers.formatEther(balance)} ETH`);
        console.error(`   ⚠️  Please fund the signer wallet with more ETH`);
        return;
      }

      // Step 3: Send the ball to Solana
      console.log("   📤 Sending ball to Solana...");

      const tx = await this.contract.serve({
        value: nativeFee,
        gasLimit: 500000, // Conservative gas limit
      });

      console.log(`   🔄 Transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        console.log(`   ✅ Ball sent successfully!`);
        console.log(`   🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}\n`);
      } else {
        console.error(`   ❌ Transaction failed!`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to send ball:`, error.message);
      
      // Parse specific error messages
      if (error.message.includes("insufficient funds")) {
        console.error(`   💡 Need more ETH for gas + LayerZero fees`);
      } else if (error.message.includes("Game not active")) {
        console.error(`   💡 Game is not active - initialize with serve() first`);
      } else if (error.message.includes("Circuit breaker")) {
        console.error(`   💡 Game has ended - circuit breaker triggered`);
      }
      
      throw error;
    }
  }

  logGameState(contractState: ContractState) {
    const timestamp = new Date().toLocaleTimeString();
    const status = contractState.gameState.gameActive ? "🟢" : "🔴";
    const ball = contractState.gameState.hasBall ? "✅" : "❌";
    
    console.log(`[${timestamp}] ${status} Rally: ${contractState.rallyCount.toString().padStart(3)} | Ball: ${ball} | Value: ${contractState.ballValue.toString()}`);
  }

  async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    console.log("\n🛑 Stopping EVM relayer...");
    this.isRunning = false;
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting EVM Cross-Chain Relayer");
  console.log("===================================");

  // Setup provider and signer
  const provider = ethers.provider;
  const [signer] = await ethers.getSigners();
  
  console.log("Signer address:", await signer.getAddress());
  
  // Connect to deployed contract
  const PingPongEVM = await ethers.getContractFactory("PingPongEVM");
  const contract = PingPongEVM.attach(EVM_CONTRACT_ADDRESS).connect(signer);
  
  // Verify contract connection
  try {
    const owner = await (contract as any).owner();
    console.log("Contract owner:", owner);
    console.log("✅ Connected to PingPongEVM contract\n");
  } catch (error) {
    console.error("❌ Failed to connect to contract:", error);
    process.exit(1);
  }

  // Create and start relayer
  const relayer = new EVMRelayer(contract as any, provider, signer);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    relayer.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    relayer.stop();
    process.exit(0);
  });

  // Start the relayer
  await relayer.start();
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});