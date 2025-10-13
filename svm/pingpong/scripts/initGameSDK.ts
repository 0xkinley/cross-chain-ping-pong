import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

// Program and Endpoint IDs
const PROGRAM_ID = new PublicKey("Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF");
const LAYERZERO_ENDPOINT = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");
const REMOTE_EID = 40161; // Sepolia testnet

async function main() {
  console.log("🚀 Initializing game via initStore (aligned with init_game.rs)...");

  // Set provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Pingpong as anchor.Program; // using workspace any-type to avoid TS type import

  const adminPublicKey = provider.wallet.publicKey;

  // Derive PDAs exactly as on-chain seeds
  const [gamePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    PROGRAM_ID
  );

  const [lzReceiveTypesAccountsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("LzReceiveTypes"), Buffer.from("game_state")],
    PROGRAM_ID
  );

  console.log("📋 Inputs");
  console.log("  Admin:", adminPublicKey.toString());
  console.log("  Endpoint:", LAYERZERO_ENDPOINT.toString());
  console.log("  Remote EID:", REMOTE_EID);
  console.log("📦 PDAs");
  console.log("  Game:", gamePDA.toString());
  console.log("  LzReceiveTypes:", lzReceiveTypesAccountsPDA.toString());

  try {
    const txSig = await program.methods
      .initStore({
        admin: adminPublicKey,
        endpoint: LAYERZERO_ENDPOINT,
        remoteEid: REMOTE_EID,
      })
      .accounts({
        payer: adminPublicKey,
        game: gamePDA,
        lzReceiveTypesAccounts: lzReceiveTypesAccountsPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ initStore succeeded");
    console.log("  Tx:", txSig);

    // Optional: fetch GameState to confirm
    try {
      const gameAccount: any = await program.account.gameState.fetch(gamePDA);
      console.log("📑 GameState:");
      console.log("  admin:", gameAccount.admin.toString());
      console.log("  endpointProgram:", gameAccount.endpointProgram.toString());
      console.log("  remoteEid:", gameAccount.remoteEid);
      console.log("  gameActive:", gameAccount.gameActive);
      console.log("  paused:", gameAccount.paused);
    } catch (e) {
      console.log("(Info) Could not decode GameState yet:", e?.toString?.() ?? e);
    }
  } catch (error: any) {
    console.error("❌ initStore failed");
    console.error(error);

    // Minimal diagnostics
    try {
      const gameInfo = await provider.connection.getAccountInfo(gamePDA);
      const lzTypesInfo = await provider.connection.getAccountInfo(lzReceiveTypesAccountsPDA);
      console.log("🔍 Account existence:");
      console.log("  game:", !!gameInfo, gameInfo ? `(${gameInfo.data.length} bytes)` : "");
      console.log("  lzReceiveTypes:", !!lzTypesInfo, lzTypesInfo ? `(${lzTypesInfo.data.length} bytes)` : "");
    } catch (diagErr) {
      console.log("(Diag) Failed to fetch account infos:", diagErr?.toString?.() ?? diagErr);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
