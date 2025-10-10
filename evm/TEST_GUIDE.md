# PingPongEVM Testing & Deployment

## Test Coverage

### Comprehensive Test Suite

The project includes two main test files:

#### 1. `test/PingPongEVM.test.ts` - Functional Tests
- **Deployment**: Contract initialization and configuration
- **Game State Management**: Funding, pausing, game lifecycle
- **Quote Function**: LayerZero fee estimation
- **Serve Function**: Game initiation validation
- **Access Control**: Owner permissions, peer management
- **Gas Optimization**: Verification of optimizations
- **Receive/Fallback**: ETH acceptance functions
- **Helper Functions**: Internal function testing
- **Integration Scenarios**: Multi-operation workflows

#### 2. `test/PingPongEVM.gas.test.ts` - Gas Analysis
- **Gas Optimization Analysis**: Measures actual gas usage
- **Custom Error Efficiency**: Demonstrates gas savings from custom errors
- **State Variable Packing**: Verifies packed storage optimization

### Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/PingPongEVM.test.ts

# Run gas analysis tests
npx hardhat test test/PingPongEVM.gas.test.ts

# Run specific test group
npx hardhat test --grep "Deployment"
npx hardhat test --grep "Gas Optimization"
```

## Deployment

### Using Ignition (Recommended)

The `ignition/modules/PingPongEVM.ts` module provides deployment configuration:

```bash
# Deploy to local network
npx hardhat ignition deploy ./ignition/modules/PingPongEVM.ts --parameters '{"endpoint": "0x6EDCE65403992e310A62460808c4b910D972f10f", "peerEid": 40168, "owner": "YOUR_ADDRESS_HERE"}'

# Deploy to testnet (e.g., Sepolia)
npx hardhat ignition deploy ./ignition/modules/PingPongEVM.ts --network sepolia --parameters '{"endpoint": "0x6EDCE65403992e310A62460808c4b910D972f10f", "peerEid": 40168, "owner": "YOUR_ADDRESS_HERE"}'
```

### LayerZero Endpoint Addresses

- **Ethereum Mainnet**: `0x1a44076050125825900e736c501f859c50fE728c`
- **Sepolia Testnet**: `0x6EDCE65403992e310A62460808c4b910D972f10f`
- **Arbitrum One**: `0x3c2269811836af69497E5F486A85D7316753cf62`
- **Optimism**: `0x3c2269811836af69497E5F486A85D7316753cf62`

### Endpoint IDs

- **Solana Mainnet**: `30168`
- **Solana Devnet**: `40168`

## Test Results Summary

**27 tests passing**
- Complete functional coverage
- Gas optimization verification
- Security and access control validation
- Integration scenario testing

### Gas Optimization Results

From the test output:
- **Fund contract**: ~22,868 gas
- **Withdraw**: ~31,782 gas
- **State packing**: Single storage slot for `GameState` struct
- **Custom errors**: Efficient error handling

## Key Features Tested

1. **State Variable Packing**: `maxRallies`, `hasBall`, and `gameActive` packed into single storage slot
2. **Custom Errors**: `SelfCallFailed`, `OnlySelfCall`, `InvalidAddress`, `WithdrawFailed`
3. **Access Control**: Owner-only functions with proper validation
4. **LayerZero Integration**: Mocked endpoint for testing cross-chain functionality
5. **Gas Efficiency**: Optimized storage access and error handling

## Security Validations

- Owner-only access for critical functions
- Invalid parameter rejection
- Zero address validation
- Insufficient fee detection
- Game state consistency checks
- Self-call validation for internal functions

The test suite provides comprehensive coverage ensuring the contract is production-ready with optimal gas efficiency and robust security measures.