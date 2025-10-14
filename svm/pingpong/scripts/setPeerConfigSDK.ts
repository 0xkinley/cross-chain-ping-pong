// setPeerConfig.ts (core call)
import * as fs from "fs";
import * as path from "path";
import * as anchor from "@coral-xyz/anchor";
import { Program, Idl, BorshCoder, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const IDL_PATH = path.resolve(__dirname, "../target/idl/pingpong.json");
const GAME_STATE_SEED = "game_state";
const PEER_SEED = "Peer";
const REMOTE_EID = 40161;
const EVM_CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";

function u32be(n: number) { return new BN(n).toArrayLike(Buffer, "be", 4); }
function evmToBytes32(hex: string): number[] {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  const src = Buffer.from(h, "hex");              
  const out = Buffer.alloc(32); src.copy(out, 12);
  return [...out];
}

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl: Idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const PROGRAM_ID = new PublicKey((idl as any).metadata.address);
  const program = new Program(idl, PROGRAM_ID, provider);
  const coder = new BorshCoder(idl);

  const admin = provider.wallet.publicKey;
  const [gamePDA] = PublicKey.findProgramAddressSync([Buffer.from(GAME_STATE_SEED)], PROGRAM_ID);
  const [peerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(PEER_SEED), gamePDA.toBuffer(), u32be(REMOTE_EID)],
    PROGRAM_ID
  );

  const bytes32 = evmToBytes32(EVM_CONTRACT_ADDRESS);

 
  const candidates = [
    { PeerAddress: [bytes32] },
    { PeerAddress: { "0": bytes32 } },
    { peerAddress: [bytes32] },      
    { peerAddress: { "0": bytes32 } },
  ];
  let cfg: any | null = null;
  for (const c of candidates) {
    try { coder.types.encode("PeerConfigParam", c); cfg = c; break; } catch {}
  }
  if (!cfg) throw new Error("Could not encode PeerConfigParam::PeerAddress");

  const sig = await program.methods
    .setPeerConfig({ remoteEid: REMOTE_EID, config: cfg } as any)
    .accounts({ admin, game: gamePDA, peer: peerPDA, systemProgram: SystemProgram.programId })
    .rpc();

  console.log(" setPeerConfig tx:", sig);
})().catch((e) => { console.error(e); process.exit(1); });
