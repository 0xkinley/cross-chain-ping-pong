import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Pingpong } from "../target/types/pingpong";

const PROGRAM_ID = new PublicKey("Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF");

async function main() {
  console.log(" Checking game account state...");
  
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Pingpong as anchor.Program<Pingpong>;
  
  const adminPublicKey = provider.wallet.publicKey;

 
  const [gamePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    PROGRAM_ID
  );

  console.log("Game PDA:", gamePDA.toString());
  console.log("Admin:", adminPublicKey.toString());

  try {
   
    const gameAccount = await program.account.gameState.fetch(gamePDA);
    console.log(" Game account successfully deserialized!");
    console.log("Game admin:", gameAccount.admin.toString());
    console.log("Game endpoint:", gameAccount.endpointProgram.toString());
    console.log("Game active:", gameAccount.gameActive);
    console.log("Ball value:", gameAccount.ballValue.toString());
    console.log("Rally count:", gameAccount.rallyCount.toString());
    
   
    if (gameAccount.admin.equals(adminPublicKey)) {
      console.log(" Admin matches!");
    } else {
      console.log(" Admin mismatch!");
      console.log("Expected:", adminPublicKey.toString());
      console.log("Got:", gameAccount.admin.toString());
    }
    
  } catch (error) {
    console.log(" Failed to fetch game account:");
    console.error(error);
    
   
    try {
      const accountInfo = await provider.connection.getAccountInfo(gamePDA);
      if (accountInfo) {
        console.log("Raw account exists with", accountInfo.data.length, "bytes");
        console.log("Owner:", accountInfo.owner.toString());
      }
    } catch (rawError) {
      console.log("Failed to get raw account info:", rawError);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});