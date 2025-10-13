import fs from "fs";
import path from "path";
import * as anchor from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as lz from "@layerzerolabs/lz-solana-sdk-v2";
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

const IDL_PATH = path.resolve(__dirname, "../target/idl/pingpong.json");
const GAME_STATE_SEED = "game_state";
const LAYERZERO_ENDPOINT = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"); // devnet

// event authority seed (from endpoint repo)
const EVENT_SEED = Buffer.from("__event_authority", "utf8");

async function registerOappClient() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl: Idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const PROGRAM_ID = new PublicKey((idl as any).metadata.address);
  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  // oapp = your game PDA
  const [gamePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_STATE_SEED)],
    PROGRAM_ID
  );

  // derive endpoint PDAs
  const deriver = new lz.EndpointPDADeriver(LAYERZERO_ENDPOINT);
  const [oappRegistryPDA]    = deriver.oappRegistry(gamePDA);

  // derive event authority PDA on the Endpoint program
  const [eventAuthorityPDA] = PublicKey.findProgramAddressSync(
    [EVENT_SEED],
    LAYERZERO_ENDPOINT
  );

  console.log("Program ID       :", PROGRAM_ID.toBase58());
  console.log("Game PDA (OApp)  :", gamePDA.toBase58());
  console.log("OApp Registry PDA:", oappRegistryPDA.toBase58());
  console.log("Event Authority  :", eventAuthorityPDA.toBase58());
  console.log("Endpoint         :", LAYERZERO_ENDPOINT.toBase58());
  console.log("Payer/Admin      :", provider.wallet.publicKey.toBase58());

  // sanity: game exists & owned by your program
  const gameInfo = await provider.connection.getAccountInfo(gamePDA);
  if (!gameInfo) throw new Error("Game PDA not initialized. Run your init first.");
  if (!gameInfo.owner.equals(PROGRAM_ID)) {
    throw new Error(`Game owner mismatch: on-chain ${gameInfo.owner.toBase58()} vs ${PROGRAM_ID.toBase58()}`);
  }
  program.coder.accounts.decode("GameState", gameInfo.data);

  // ORDER IS CRITICAL — matches endpoint::RegisterOApp + #[event_cpi]
  const remainingAccounts = [
    { pubkey: LAYERZERO_ENDPOINT,        isWritable: false, isSigner: false }, // [0] endpoint program id
    { pubkey: provider.wallet.publicKey, isWritable: true,  isSigner: true  }, // [1] payer
    { pubkey: gamePDA,                   isWritable: true,  isSigner: false }, // [2] oapp (PDA)
    { pubkey: oappRegistryPDA,           isWritable: true,  isSigner: false }, // [3] oapp_registry (init)
    { pubkey: SystemProgram.programId,   isWritable: false, isSigner: false },
    { pubkey: eventAuthorityPDA,         isWritable: false, isSigner: false }, // [4] system_program
    { pubkey: SYSVAR_RENT_PUBKEY,        isWritable: false, isSigner: false }, 
    { pubkey: LAYERZERO_ENDPOINT,        isWritable: false, isSigner: false }// [5] rent ✅ add this
    // [6] event_authority
  ];

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }),
  );

  const sig = await program.methods
    .registerOapp()
    .accounts({
      payer: provider.wallet.publicKey,
      game: gamePDA,
    })
    .remainingAccounts(remainingAccounts)
    .preInstructions(tx.instructions)
    .rpc();

  console.log("✅ registerOapp tx:", sig);
}

registerOappClient().catch((e) => {
  console.error("Failed to register OApp:", e);
  process.exit(1);
});
