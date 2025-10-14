import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pingpong } from "../target/types/pingpong";

describe("pingpong", () => {
 
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.pingpong as Program<Pingpong>;

  it("Is initialized!", async () => {
   
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
