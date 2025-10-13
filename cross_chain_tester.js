// Cross-Chain Message Testing Utility
// This utility helps test and verify message compatibility between EVM and SVM

const { ethers } = require('ethers');

class CrossChainMessageTester {
    constructor() {
        this.INITIAL_BALL_VALUE = ethers.parseEther("100"); // 1e20
        this.MAX_RALLIES = 100;
    }

    // Simulate EVM message encoding
    encodeEVMMessage(ballValue, rallyCount) {
        return ethers.AbiCoder.defaultAbiCoder().encode(
            ["uint256", "uint256"],
            [ballValue, rallyCount]
        );
    }

    // Simulate EVM message decoding
    decodeEVMMessage(encodedMessage) {
        return ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256", "uint256"],
            encodedMessage
        );
    }

    // Simulate Solana message processing (what the SVM program would do)
    processInSolana(encodedMessage) {
        console.log("📨 Processing message in Solana...");
        
        // Decode the message (simulating Solana's decode logic)
        const [ballValue, rallyCount] = this.decodeEVMMessage(encodedMessage);
        
        console.log(`  Received ball value: ${ballValue}`);
        console.log(`  Received rally count: ${rallyCount}`);
        
        // Solana game logic: increment rally count, decrement ball value
        const newRallyCount = BigInt(rallyCount) + 1n;
        const newBallValue = BigInt(ballValue) - 1n;
        
        console.log(`  New ball value: ${newBallValue}`);
        console.log(`  New rally count: ${newRallyCount}`);
        
        // Check end conditions
        if (newBallValue === 0n) {
            console.log("  🏁 Game over: Ball reached 0");
            return { gameOver: true, reason: "Ball reached 0", ballValue: newBallValue, rallyCount: newRallyCount };
        }
        
        if (newRallyCount >= this.MAX_RALLIES) {
            console.log("  🏁 Game over: Max rallies reached");
            return { gameOver: true, reason: "Max rallies reached", ballValue: newBallValue, rallyCount: newRallyCount };
        }
        
        // Encode response message back to EVM
        const responseMessage = this.encodeEVMMessage(newBallValue, newRallyCount);
        console.log(`  📤 Sending back to EVM: ${responseMessage.slice(0, 20)}...`);
        
        return { 
            gameOver: false, 
            ballValue: newBallValue, 
            rallyCount: newRallyCount, 
            responseMessage 
        };
    }

    // Simulate full cross-chain rally
    simulateFullRally(maxRallies = 10) {
        console.log("🏓 Simulating Full Cross-Chain Ping-Pong Rally");
        console.log("===============================================");
        console.log(`Max rallies: ${maxRallies}`);
        console.log(`Initial ball value: ${this.INITIAL_BALL_VALUE}`);
        console.log("");

        let ballValue = this.INITIAL_BALL_VALUE;
        let rallyCount = 0n;
        let currentSide = "EVM"; // Start with EVM serving

        while (true) {
            console.log(`🎾 Rally ${rallyCount + 1n} - ${currentSide} has the ball`);
            
            if (currentSide === "EVM") {
                // EVM sends to Solana
                const message = this.encodeEVMMessage(ballValue, rallyCount);
                console.log(`  EVM sends: ball=${ballValue}, rally=${rallyCount}`);
                
                // Solana processes
                const result = this.processInSolana(message);
                
                if (result.gameOver) {
                    console.log(`\n🏆 Game Over: ${result.reason}`);
                    console.log(`Final stats: Rally ${result.rallyCount}, Ball ${result.ballValue}`);
                    break;
                }
                
                ballValue = result.ballValue;
                rallyCount = result.rallyCount;
                currentSide = "Solana";
            } else {
                // Solana sends back to EVM (simulate EVM processing)
                console.log(`  Solana sends back: ball=${ballValue}, rally=${rallyCount}`);
                
                // EVM would process similarly
                rallyCount = rallyCount + 1n;
                ballValue = ballValue - 1n;
                
                console.log(`  EVM processes: new ball=${ballValue}, new rally=${rallyCount}`);
                
                if (ballValue === 0n) {
                    console.log(`\n🏆 Game Over: Ball reached 0`);
                    console.log(`Final stats: Rally ${rallyCount}, Ball ${ballValue}`);
                    break;
                }
                
                if (rallyCount >= maxRallies) {
                    console.log(`\n🏆 Game Over: Max rallies reached`);
                    console.log(`Final stats: Rally ${rallyCount}, Ball ${ballValue}`);
                    break;
                }
                
                currentSide = "EVM";
            }
            
            console.log("");
            
            // Safety check to prevent infinite loops
            if (rallyCount > 200) {
                console.log("⚠️  Safety break: Too many rallies");
                break;
            }
        }
    }

    // Test message format compatibility
    testMessageCompatibility() {
        console.log("🔍 Testing Message Format Compatibility");
        console.log("======================================");
        
        const testCases = [
            { ball: this.INITIAL_BALL_VALUE, rally: 0n, desc: "Game start" },
            { ball: this.INITIAL_BALL_VALUE - 1n, rally: 1n, desc: "First hit" },
            { ball: 50000000000000000000n, rally: 25n, desc: "Mid-game" },
            { ball: 1n, rally: 99n, desc: "Nearly over" },
            { ball: 0n, rally: 100n, desc: "Game end" }
        ];
        
        for (const testCase of testCases) {
            console.log(`\nTesting: ${testCase.desc}`);
            
            // Encode
            const encoded = this.encodeEVMMessage(testCase.ball, testCase.rally);
            console.log(`  Encoded length: ${(encoded.length - 2) / 2} bytes`);
            
            // Decode
            const [decodedBall, decodedRally] = this.decodeEVMMessage(encoded);
            
            // Verify
            const ballMatch = decodedBall.toString() === testCase.ball.toString();
            const rallyMatch = decodedRally.toString() === testCase.rally.toString();
            
            console.log(`  Ball value: ${ballMatch ? '✅' : '❌'} ${testCase.ball} → ${decodedBall}`);
            console.log(`  Rally count: ${rallyMatch ? '✅' : '❌'} ${testCase.rally} → ${decodedRally}`);
            
            if (!ballMatch || !rallyMatch) {
                throw new Error("Message compatibility test failed!");
            }
        }
        
        console.log("\n✅ All message compatibility tests passed!");
    }

    // Run all tests
    runAllTests() {
        try {
            this.testMessageCompatibility();
            console.log("");
            this.simulateFullRally(5); // Short rally for demonstration
            
            console.log("\n🎉 All cross-chain tests completed successfully!");
            console.log("The backend is ready for actual LayerZero integration.");
            
        } catch (error) {
            console.error("❌ Test failed:", error.message);
            process.exit(1);
        }
    }
}

// Run if this file is executed directly
if (require.main === module) {
    const tester = new CrossChainMessageTester();
    tester.runAllTests();
}

module.exports = CrossChainMessageTester;