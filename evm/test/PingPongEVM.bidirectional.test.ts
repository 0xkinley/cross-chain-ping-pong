import { expect } from "chai";
import { ethers } from "hardhat";
import { PingPongEVMTester } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PingPongEVM Bidirectional Initiation", function () {

  let tester: PingPongEVMTester;
  let owner: SignerWithAddress;
  const SOLANA_PEER_ID = 1;


  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const TesterFactory = await ethers.getContractFactory("PingPongEVMTester");
    tester = await TesterFactory.deploy(
      "0x1a44076050125825900e736c501f859c50fE728c",
      SOLANA_PEER_ID,
      owner.address
    );

    const solanaAddress = "0x" + "1".repeat(64);
    await tester.setPeer(SOLANA_PEER_ID, ethers.getBytes(solanaAddress));
  });


  it("should handle Solana-first ping (auto-initialization)", async function () {
    const gameStateBefore = await tester.gameState();
    expect(gameStateBefore.gameActive).to.be.false;

    const incomingMessage = ethers.solidityPacked(
      ["uint256", "uint256"],
      [100, 5]
    );

    const mockOrigin = {
      srcEid: SOLANA_PEER_ID,
      sender: "0x" + "1".repeat(64),
      nonce: 1
    };
    const mockGuid = "0x" + "a".repeat(64);

    await tester.testLzReceive(
      mockOrigin,
      mockGuid,
      incomingMessage,
      owner.address,
      "0x"
    );

    const gameStateAfter = await tester.gameState();
    expect(gameStateAfter.gameActive).to.be.true;
    
    expect(await tester.ballValue()).to.equal(99);
    
    expect(await tester.rallyCount()).to.equal(6);
    
    expect(gameStateAfter.hasBall).to.be.true;
    
    console.log("Success: Either chain can now initiate the game!");
    console.log(`   Game auto-started with ball value: ${await tester.ballValue()}`);
    console.log(`   Rally count continued from: ${await tester.rallyCount()}`);
  });

  it("should handle EVM-first initiation (traditional serve)", async function () {
    await owner.sendTransaction({
      to: await tester.getAddress(),
      value: ethers.parseEther("0.1")
    });

    const options = "0x";
    await tester.serve(10, options, { value: ethers.parseEther("0.01") });

    const gameState = await tester.gameState();
    expect(gameState.gameActive).to.be.true;
    
    expect(gameState.hasBall).to.be.false;
    expect(await tester.rallyCount()).to.equal(0);
    
    console.log("Success: EVM can still initiate games traditionally!");
    console.log(`   Game started with max rallies: ${gameState.maxRallies}`);
    console.log(`   Rally count: ${await tester.rallyCount()}`);
  });

  it("should demonstrate the key improvement", async function () {
    console.log("\nKEY IMPROVEMENT DEMONSTRATION:");
    console.log("Before: Only EVM could start the ping-pong game");
    console.log("After: Either EVM OR Solana can start the ping-pong game");
    console.log("\nThis enables true peer-to-peer cross-chain gaming!");
  });
});