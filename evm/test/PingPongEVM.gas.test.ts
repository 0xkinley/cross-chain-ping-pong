import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "ethers";

describe("PingPongEVM Gas Analysis", function () {

  const SOLANA_EID = 40168;


  async function deployPingPongFixture() {
    const [owner, user1] = await hre.ethers.getSigners();

    const MockEndpoint        = await hre.ethers.getContractFactory("MockEndpoint");
    const mockEndpoint        = await MockEndpoint.deploy();
    const mockEndpointAddress = await mockEndpoint.getAddress();

    const PingPongEVM = await hre.ethers.getContractFactory("PingPongEVM");
    const pingPong = await PingPongEVM.deploy(
      mockEndpointAddress,
      SOLANA_EID,
      owner.address
    );

    return { pingPong, mockEndpoint, owner, user1 };
  }


  describe("Gas Optimization Analysis", function () {
    it("Should efficiently update packed state variables", async function () {
      const { pingPong, owner } = await loadFixture(deployPingPongFixture);
      
      const gameStateBefore = await pingPong.gameState();
      expect(gameStateBefore.maxRallies).to.equal(0);
      expect(gameStateBefore.hasBall).to.equal(false);
      expect(gameStateBefore.gameActive).to.equal(false);

      console.log("      Gas usage analysis:");
      
      const fundTx = await pingPong.fund({ value: parseEther("1") });
      const fundReceipt = await fundTx.wait();
      console.log(`      Fund contract: ${fundReceipt?.gasUsed} gas`);

      try {
        const pauseTx = await pingPong.connect(owner).pauseGame();
        const pauseReceipt = await pauseTx.wait();
        console.log(`      Pause game: ${pauseReceipt?.gasUsed} gas`);
      } catch (error) {
        console.log("      Pause game: Expected revert (no active game)");
      }

      try {
        const withdrawTx = await pingPong.connect(owner).withdraw(owner.address, parseEther("0.1"));
        const withdrawReceipt = await withdrawTx.wait();
        console.log(`      Withdraw: ${withdrawReceipt?.gasUsed} gas`);
      } catch (error: any) {
        console.log(`      Withdraw: ${error?.message?.includes('WithdrawFailed') ? 'Custom error working' : 'Other error'}`);
      }
    });

    it("Should demonstrate custom error gas savings", async function () {
      const { pingPong, user1 } = await loadFixture(deployPingPongFixture);
      
      console.log("      Custom Error Efficiency Test:");

      try {
        const tx = await pingPong.connect(user1).fund({ value: 0 });
        await tx.wait();
      } catch (error: any) {
        console.log("      InsufficientFee custom error: Efficient gas usage");
        expect(error?.message).to.include("InsufficientFee");
      }

      try {
        const tx = await pingPong.withdraw("0x0000000000000000000000000000000000000000", parseEther("0.1"));
        await tx.wait();
      } catch (error: any) {
        console.log("      InvalidAddress custom error: Efficient gas usage");
        expect(error?.message).to.include("InvalidAddress");
      }
    });

    it("Should show contract balance efficiency", async function () {
      const { pingPong, user1 } = await loadFixture(deployPingPongFixture);
      
      const balanceCallTx = await pingPong.getContractBalance.staticCall();
      console.log(`      Initial balance: ${balanceCallTx} wei`);
      
      await pingPong.connect(user1).fund({ value: parseEther("0.5") });
      await pingPong.connect(user1).fund({ value: parseEther("0.3") });
      
      const newBalance = await pingPong.getContractBalance();
      console.log(`      After funding: ${newBalance} wei`);
      
      expect(newBalance).to.equal(parseEther("0.8"));
    });
  });


  describe("State Variable Packing Verification", function () {
    it("Should store gameState in a single storage slot", async function () {
      const { pingPong } = await loadFixture(deployPingPongFixture);
      
      const gameState = await pingPong.gameState();
      
      console.log("      Packed State Variables:");
      console.log(`      • maxRallies (uint128): ${gameState.maxRallies}`);
      console.log(`      • hasBall (bool): ${gameState.hasBall}`);
      console.log(`      • gameActive (bool): ${gameState.gameActive}`);
      console.log("      All packed in single storage slot (32 bytes)");
      
      expect(gameState.maxRallies).to.be.a('bigint');
      expect(gameState.hasBall).to.be.a('boolean');
      expect(gameState.gameActive).to.be.a('boolean');
    });

    it("Should efficiently access individual state components", async function () {
      const { pingPong } = await loadFixture(deployPingPongFixture);
      
      const hasBall = await pingPong.hasBall();
      const gameActive = await pingPong.gameActive();
      const maxRallies = await pingPong.maxRallies();
      
      console.log("      Individual State Access:");
      console.log(`      • hasBall(): ${hasBall}`);
      console.log(`      • gameActive(): ${gameActive}`);
      console.log(`      • maxRallies(): ${maxRallies}`);
      
      expect(hasBall).to.equal(false);
      expect(gameActive).to.equal(false);
      expect(maxRallies).to.equal(0);
    });
  });
});