import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

// Program and Endpoint IDs
const PROGRAM_ID = new PublicKey("Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF");

async function main() {
  console.log("🗑️ Closing game account...");

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Pingpong as anchor.Program;

  const adminPublicKey = provider.wallet.publicKey;

  // Derive PDAs
  const [gamePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    PROGRAM_ID
  );

  const [lzReceiveTypesAccountsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("LzReceiveTypes"), Buffer.from("game_state")],
    PROGRAM_ID
  );

  console.log("📦 PDAs to close:");
  console.log("  Game:", gamePDA.toString());
  console.log("  LzReceiveTypes:", lzReceiveTypesAccountsPDA.toString());
  console.log("  Admin (refund to):", adminPublicKey.toString());

  try {
    // First check if accounts exist
    const gameInfo = await provider.connection.getAccountInfo(gamePDA);
    const lzTypesInfo = await provider.connection.getAccountInfo(lzReceiveTypesAccountsPDA);
    
    console.log("\n📊 Account status:");
    console.log("  Game exists:", !!gameInfo, gameInfo ? `(${gameInfo.data.length} bytes)` : "");
    console.log("  LzReceiveTypes exists:", !!lzTypesInfo, lzTypesInfo ? `(${lzTypesInfo.data.length} bytes)` : "");

    if (!gameInfo) {
      console.log("✅ Game account doesn't exist, nothing to close");
      return;
    }

    // Call closeGame instruction
    const txSig = await program.methods
      .closeGame()
      .accounts({
        admin: adminPublicKey,
        game: gamePDA,
        lzReceiveTypesAccounts: lzReceiveTypesAccountsPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Game closed successfully!");
    console.log("🔗 Transaction:", txSig);
    console.log(`🔍 View on explorer: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

    // Verify accounts are closed
    setTimeout(async () => {
      try {
        const gameInfoAfter = await provider.connection.getAccountInfo(gamePDA);
        const lzTypesInfoAfter = await provider.connection.getAccountInfo(lzReceiveTypesAccountsPDA);
        
        console.log("\n✅ Verification after close:");
        console.log("  Game exists:", !!gameInfoAfter);
        console.log("  LzReceiveTypes exists:", !!lzTypesInfoAfter);
      } catch (err) {
        console.log("Could not verify account closure:", err);
      }
    }, 2000);

  } catch (error: any) {
    console.error("❌ Failed to close game:");
    console.error(error);

    // Try to get more details about the current game state
    try {
      const gameAccount: any = await program.account.gameState.fetch(gamePDA);
      console.log("🔍 Current game state:");
      console.log("  admin:", gameAccount.admin.toString());
      console.log("  gameActive:", gameAccount.gameActive);
      console.log("  paused:", gameAccount.paused);
      console.log("  hasBall:", gameAccount.hasBall);
    } catch (fetchErr) {
      console.log("Could not fetch game state:", fetchErr);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});