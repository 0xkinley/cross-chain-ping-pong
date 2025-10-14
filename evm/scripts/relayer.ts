import { ethers } from "hardhat";
import { Contract, EventLog, Provider, Signer } from "ethers";

const EVM_CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_EID = 40168;
const CHECK_INTERVAL = 3000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

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
    console.log(" EVM Relayer starting...");
    console.log("Contract Address:", EVM_CONTRACT_ADDRESS);
    console.log("Solana EID:", SOLANA_EID);
    console.log("Check interval:", CHECK_INTERVAL, "ms\n");

    this.isRunning = true;

    this.lastProcessedBlock = await this.provider.getBlockNumber();
    console.log("Starting from block:", this.lastProcessedBlock);

    await this.checkGameState();

    while (this.isRunning) {
      try {
        await this.checkGameState();
        await this.checkForEvents();
        this.retryCount = 0;
      } catch (error: any) {
        console.error(" Error in relayer loop:", error.message);
        this.retryCount++;

        if (this.retryCount >= MAX_RETRIES) {
          console.error(`  Max retries (${MAX_RETRIES}) reached. Waiting ${RETRY_DELAY}ms before continuing...`);
          await this.sleep(RETRY_DELAY);
          this.retryCount = 0;
        }
      }

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

      this.logGameState(contractState);

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
        return;
      }

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
    return false;
  }

  async sendBall(contractState: ContractState) {
    const ballValue = contractState.ballValue;
    const rallyCount = contractState.rallyCount;

    console.log(`\n Ball ready to send!`);
    console.log(`   Value: ${ballValue.toString()}`);
    console.log(`   Rally: ${rallyCount.toString()}`);

    try {
      console.log("    Getting LayerZero fee quote...");
      
      const options = "0x";
      const payInLzToken = false;
      const quote = await this.contract.quote(ballValue, rallyCount, options, payInLzToken);
      const nativeFee = quote.nativeFee;

      console.log(`    LayerZero fee: ${ethers.formatEther(nativeFee)} ETH`);

      const balance = await this.provider.getBalance(await this.signer.getAddress());
      console.log(`   💼 Signer balance: ${ethers.formatEther(balance)} ETH`);

      if (balance < nativeFee) {
        console.error(`     Insufficient balance! Need ${ethers.formatEther(nativeFee)} ETH, have ${ethers.formatEther(balance)} ETH`);
        console.error(`     Please fund the signer wallet with more ETH`);
        return;
      }

      console.log("   📤 Sending ball to Solana...");

      const tx = await this.contract.serve({
        value: nativeFee,
        gasLimit: 500000,
      });

      console.log(`    Transaction submitted: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        console.log(`    Ball sent successfully!`);
        console.log(`    View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}\n`);
      } else {
        console.error(`    Transaction failed!`);
      }
    } catch (error: any) {
      console.error(`    Failed to send ball:`, error.message);
      
      if (error.message.includes("insufficient funds")) {
        console.error(`    Need more ETH for gas + LayerZero fees`);
      } else if (error.message.includes("Game not active")) {
        console.error(`    Game is not active - initialize with serve() first`);
      } else if (error.message.includes("Circuit breaker")) {
        console.error(`    Game has ended - circuit breaker triggered`);
      }
      
      throw error;
    }
  }

  logGameState(contractState: ContractState) {
    const timestamp = new Date().toLocaleTimeString();
    const status = contractState.gameState.gameActive ? "" : "🔴";
    const ball = contractState.gameState.hasBall ? "" : "";
    
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

async function main() {
  console.log(" Starting EVM Cross-Chain Relayer");

  const provider = ethers.provider;
  const [signer] = await ethers.getSigners();
  
  console.log("Signer address:", await signer.getAddress());
  
  const PingPongEVM = await ethers.getContractFactory("PingPongEVM");
  const contract = PingPongEVM.attach(EVM_CONTRACT_ADDRESS).connect(signer);
  
  try {
    const owner = await (contract as any).owner();
    console.log("Contract owner:", owner);
    console.log(" Connected to PingPongEVM contract\n");
  } catch (error) {
    console.error(" Failed to connect to contract:", error);
    process.exit(1);
  }

  const relayer = new EVMRelayer(contract as any, provider, signer);

  process.on("SIGINT", () => {
    relayer.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    relayer.stop();
    process.exit(0);
  });

  await relayer.start();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});