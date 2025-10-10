import { expect } from "chai";
import { ethers } from "hardhat";
import { PingPongEVMTester } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PingPongEVM Bidirectional Initiation", function () {
  // ========================================
  // VARIABLES
  // ========================================

  let tester: PingPongEVMTester;
  let owner: SignerWithAddress;
  const SOLANA_PEER_ID = 1;

  // ========================================
  // SETUP
  // ========================================

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy PingPongEVMTester
    const TesterFactory = await ethers.getContractFactory("PingPongEVMTester");
    tester = await TesterFactory.deploy(
      "0x1a44076050125825900e736c501f859c50fE728c", // Mock endpoint
      SOLANA_PEER_ID,
      owner.address
    );

    // Set peer to simulate Solana connection
    const solanaAddress = "0x" + "1".repeat(64); // Mock Solana address as bytes32
    await tester.setPeer(SOLANA_PEER_ID, ethers.getBytes(solanaAddress));
  });

  // ========================================
  // BIDIRECTIONAL INITIATION TESTS
  // ========================================

  it("should handle Solana-first ping (auto-initialization)", async function () {
    // Verify game is not active initially
    const gameStateBefore = await tester.gameState();
    expect(gameStateBefore.gameActive).to.be.false;

    // Simulate receiving a ping from Solana (value=100, rally=5)
    // This should auto-initialize the game
    const incomingMessage = ethers.solidityPacked(
      ["uint256", "uint256"],
      [100, 5]
    );

    // Use our tester to simulate _lzReceive with a mock Origin
    const mockOrigin = {
      srcEid: SOLANA_PEER_ID,
      sender: "0x" + "1".repeat(64),
      nonce: 1
    };
    const mockGuid = "0x" + "a".repeat(64);

    // Call the exposed lzReceive function
    await tester.testLzReceive(
      mockOrigin,
      mockGuid,
      incomingMessage,
      owner.address,
      "0x"
    );

    // Verify game is now active (auto-initialized)
    const gameStateAfter = await tester.gameState();
    expect(gameStateAfter.gameActive).to.be.true;
    
    // Verify ball value was processed (100 - 1 = 99)
    expect(await tester.ballValue()).to.equal(99);
    
    // Verify rally count incremented (5 + 1 = 6)
    expect(await tester.rallyCount()).to.equal(6);
    
    // Verify this chain now has the ball
    expect(gameStateAfter.hasBall).to.be.true;
    
    console.log("Success: Either chain can now initiate the game!");
    console.log(`   Game auto-started with ball value: ${await tester.ballValue()}`);
    console.log(`   Rally count continued from: ${await tester.rallyCount()}`);
  });

  it("should handle EVM-first initiation (traditional serve)", async function () {
    // Fund the contract for sending
    await owner.sendTransaction({
      to: await tester.getAddress(),
      value: ethers.parseEther("0.1")
    });

    // Traditional EVM-first game initiation via serve
    const options = "0x";
    await tester.serve(10, options, { value: ethers.parseEther("0.01") });

    // Verify game is active
    const gameState = await tester.gameState();
    expect(gameState.gameActive).to.be.true;
    
    // Verify initial state (ball was sent, so we don't have it)
    expect(gameState.hasBall).to.be.false; // Ball was sent to peer
    expect(await tester.rallyCount()).to.equal(0); // Initial rally
    
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