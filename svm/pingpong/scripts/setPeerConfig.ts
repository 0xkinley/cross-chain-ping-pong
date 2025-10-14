import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pingpong } from "../target/types/pingpong";
import { PublicKey } from "@solana/web3.js";

const ADMIN = anchor.AnchorProvider.env().wallet.publicKey;
const REMOTE_EID = 40161;

// TODO: Replace with your actual EVM ping pong contract address on Sepolia
// Example: "0x1234567890123456789012345678901234567890"
const EVM_CONTRACT_ADDRESS = "0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365";

// Convert EVM address to 32-byte array (LayerZero format)
function evmAddressToBytes32(address: string): Uint8Array {
 
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
 
  const addressBytes = new Uint8Array(32);
  const addressBuffer = Buffer.from(cleanAddress, 'hex');
  
 
  addressBytes.set(addressBuffer, 32 - addressBuffer.length);
  
  return addressBytes;
}

const PEER_ADDRESS = evmAddressToBytes32(EVM_CONTRACT_ADDRESS);

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Pingpong as Program<Pingpong>;

  const [gamePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    program.programId
  );

 
  const remoteEidBytes = Buffer.allocUnsafe(4);
  remoteEidBytes.writeUInt32BE(REMOTE_EID, 0);

  const [peerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("Peer"), gamePDA.toBuffer(), remoteEidBytes],
    program.programId
  );


  console.log(" Setting peer configuration...");
  console.log("Game PDA:", gamePDA.toString());  
  console.log("Peer PDA:", peerPDA.toString());
  console.log("Remote EID:", REMOTE_EID);
  console.log("Remote Contract:", EVM_CONTRACT_ADDRESS);
  console.log("Admin:", ADMIN.toString());

  try {
    const tx = await program.methods
      .setPeerConfig({
        remoteEid: REMOTE_EID,
        config: { kind: "peerAddress", fields: [PEER_ADDRESS] },
      } as any)
    .accounts({
      admin: ADMIN,
      game: gamePDA,
      peer: peerPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

    console.log(" Peer config set!");
    console.log("TX:", tx);
    console.log("Peer PDA:", peerPDA.toString());
  } catch (error) {
    console.log(" Failed to set peer configuration:", error);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
