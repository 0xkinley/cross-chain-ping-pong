// scripts/registerOapp.ts
import fs from "fs";
import path from "path";
import * as anchor from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import * as lz from "@layerzerolabs/lz-solana-sdk-v2";


const IDL_PATH = path.resolve(__dirname, "../target/idl/pingpong.json");
const GAME_STATE_SEED = "game_state";
const LAYERZERO_ENDPOINT = new PublicKey(
  "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6" // devnet endpoint
);

async function registerOappClient() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  if (!fs.existsSync(IDL_PATH)) {
    throw new Error(`IDL not found at ${IDL_PATH}. Did you run 'anchor build'?`);
  }
  const idl: Idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const PROGRAM_ID = new PublicKey((idl as any).metadata.address);
  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  const [gamePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_STATE_SEED)],
    PROGRAM_ID
  );

  console.log("Registering OApp with LayerZero…");
  console.log("Program ID       :", PROGRAM_ID.toBase58());
  console.log("Game PDA (OApp)  :", gamePDA.toBase58());
  console.log("Endpoint         :", LAYERZERO_ENDPOINT.toBase58());
  console.log("Payer/Admin      :", provider.wallet.publicKey.toBase58());

  const gameInfo = await provider.connection.getAccountInfo(gamePDA);
  if (!gameInfo) throw new Error("Game PDA not initialized. Run your init instruction first.");
  if (!gameInfo.owner.equals(PROGRAM_ID)) {
    throw new Error(
      `Game owner mismatch: on-chain ${gameInfo.owner.toBase58()} vs client ${PROGRAM_ID.toBase58()}`
    );
  }

  program.coder.accounts.decode("GameState", gameInfo.data);
  console.log("GameState decoded OK");


  const endpointDeriver = new lz.EndpointPDADeriver(LAYERZERO_ENDPOINT);
  const [oappRegistryPDA] = endpointDeriver.oappRegistry(gamePDA);
  const [endpointSettingPDA] = endpointDeriver.setting();

  console.log("Derived OApp Registry PDA:", oappRegistryPDA.toBase58());
  console.log("Derived Setting PDA     :", endpointSettingPDA.toBase58());
  const remainingAccounts = [
    { pubkey: oappRegistryPDA,      isWritable: true,  isSigner: false }, // 0
    { pubkey: endpointSettingPDA,   isWritable: false, isSigner: false }, // 1
    { pubkey: SystemProgram.programId, isWritable: false, isSigner: false }, // 2
    { pubkey: SYSVAR_RENT_PUBKEY,      isWritable: false, isSigner: false }, // 3
  ];
  console.log("Remaining accounts:", remainingAccounts.length);
  const sig = await program.methods
    .registerOapp()
    .accounts({
      payer: provider.wallet.publicKey,
      game: gamePDA,
      endpointProgram: LAYERZERO_ENDPOINT,    
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .rpc();

  console.log("registerOapp tx:", sig);
  const reg = await provider.connection.getAccountInfo(oappRegistryPDA);
  console.log("OAppRegistry exists? ", !!reg, reg ? `len=${reg.data.length}` : "");
}

registerOappClient().catch((e) => {
  console.error("Failed to register OApp:", e);
  process.exit(1);
});
