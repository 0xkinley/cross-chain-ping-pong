import * as fs from "fs";
import * as path from "path";
import * as anchor from "@coral-xyz/anchor";
import { Program, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const IDL_PATH = path.resolve(__dirname, "../target/idl/pingpong.json");
const GAME_STATE_SEED = "game_state";
const PEER_SEED = "Peer";
const SEPOLIA_EID = 40168;
const EVM_CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";
const SOLANA_ENDPOINT = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");

function u32be(n: number) { 
  return new BN(n).toArrayLike(Buffer, "be", 4); 
}

async function main() {
  console.log("🎾 Solana → EVM Ball Sender");
  console.log("===========================");
  
  try {
    // Setup provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // Load IDL and create program instance
    const idl: Idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
    const PROGRAM_ID = new PublicKey((idl as any).metadata.address);
    const program = new Program(idl, PROGRAM_ID, provider);

    console.log("Program ID:", PROGRAM_ID.toString());
    console.log("Signer:", provider.wallet.publicKey.toString());

    // Derive PDAs
    const [gamePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(GAME_STATE_SEED)], 
      PROGRAM_ID
    );
    
    const [peerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(PEER_SEED), gamePDA.toBuffer(), u32be(SEPOLIA_EID)],
      PROGRAM_ID
    );

    console.log("Game PDA:", gamePDA.toString());
    console.log("Peer PDA:", peerPDA.toString());

    // Check current game state
    try {
      const gameState = await program.account.gameState.fetch(gamePDA);
      console.log("\n🎯 Current Game State:");
      console.log("Ball Value:", gameState.ballValue.toString());
      console.log("Rally Count:", gameState.rallyCount.toString());
      console.log("Has Ball:", gameState.hasBall);
      console.log("Game Active:", gameState.gameActive);
      console.log("Paused:", gameState.paused);

      if (!gameState.gameActive) {
        console.log("\n❌ Game is not active!");
        console.log("You need to initialize the game first with initStore()");
        return;
      }

      if (!gameState.hasBall) {
        console.log("\n❌ Solana doesn't have the ball!");
        console.log("Wait for a ball to be received from EVM first");
        return;
      }

      // If we have the ball and game is active, send it!
      const ballValue = gameState.ballValue;
      const rallyCount = gameState.rallyCount;

      console.log("\n🏓 Sending ball to EVM...");
      console.log("Current ball value:", ballValue.toString());
      console.log("Current rally count:", rallyCount.toString());

      // Step 1: Get quote for LayerZero fee
      console.log("\n💰 Getting LayerZero fee quote...");
      
      const quoteTx = await program.methods
        .quoteSend({
          dstEid: SEPOLIA_EID,
          ballValue: ballValue,
          options: Buffer.from([]), // Empty options
        })
        .accounts({
          game: gamePDA,
          peer: peerPDA,
          endpoint: SOLANA_ENDPOINT,
        })
        .simulate();

      console.log("Quote simulation successful");

      // Use a conservative fee estimate
      const estimatedFee = 1_000_000; // 0.001 SOL
      console.log(`Estimated fee: ${estimatedFee} lamports (0.001 SOL)`);

      // Step 2: Check game PDA balance
      const connection = provider.connection;
      const balance = await connection.getBalance(gamePDA);
      console.log(`Game PDA balance: ${balance} lamports`);

      if (balance < estimatedFee) {
        console.error(`\n❌ Insufficient balance!`);
        console.error(`Need: ${estimatedFee} lamports`);
        console.error(`Have: ${balance} lamports`);
        console.error("Fund the game PDA with more SOL first");
        return;
      }

      // Step 3: Send the ball!
      console.log("\n📤 Sending ball to EVM via LayerZero...");

      const tx = await program.methods
        .sendBall({
          dstEid: SEPOLIA_EID,
          ballValue: ballValue,
          options: Buffer.from([]), // Empty options
          nativeFee: new BN(estimatedFee),
        })
        .accounts({
          game: gamePDA,
          peer: peerPDA,
          endpoint: SOLANA_ENDPOINT,
        })
        .rpc();

      console.log("✅ Ball sent successfully!");
      console.log("Transaction:", tx);
      console.log(`🔗 View on explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      // Check new game state
      const newGameState = await program.account.gameState.fetch(gamePDA);
      console.log("\n🎯 New Game State:");
      console.log("Ball Value:", newGameState.ballValue.toString());
      console.log("Rally Count:", newGameState.rallyCount.toString());
      console.log("Has Ball:", newGameState.hasBall);
      console.log("Game Active:", newGameState.gameActive);

      console.log("\n🎉 Ball successfully sent to EVM!");
      console.log("Watch the EVM relayer for the incoming message!");

    } catch (error: any) {
      if (error.toString().includes("Account does not exist")) {
        console.log("\n❌ Game state not found!");
        console.log("You need to initialize the game first.");
        console.log("Run the initStore script or call serve() on EVM side first.");
      } else {
        throw error;
      }
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("Simulation failed")) {
      console.log("💡 This might be because:");
      console.log("- Game is not initialized");
      console.log("- Peer configuration is not set up");
      console.log("- LayerZero endpoint is not available");
    }
  }
}

main().catch(console.error);