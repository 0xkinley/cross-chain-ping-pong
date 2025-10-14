# 🏓 Cross-Chain Ping-Pong Game

A decentralized cross-chain game built with LayerZero V2 that demonstrates seamless communication between Ethereum (Sepolia) and Solana (Devnet). Players can serve and return a virtual ball across blockchains, with each rally incrementing the ball's value and rally count.

## 🌐 Architecture

```
┌─────────────────┐         LayerZero V2         ┌─────────────────┐
│   Ethereum      │◄──────────────────────────►│     Solana      │
│   (Sepolia)     │                             │    (Devnet)     │
│                 │                             │                 │
│  PingPongEVM    │         Cross-Chain         │   PingPong      │
│   Contract      │         Messaging           │   Program       │
│                 │                             │                 │
│  EID: 40161     │                             │  EID: 40168     │
└─────────────────┘                             └─────────────────┘
```

## 🚀 Features

- **Cross-Chain Messaging**: Seamless communication between Ethereum and Solana using LayerZero V2
- **Dynamic Ball Value**: Ball value increases with each cross-chain rally
- **Rally Tracking**: Automatic counting of successful cross-chain exchanges
- **Game State Management**: Synchronized game state across both chains
- **Peer Configuration**: Proper peer setup for secure cross-chain communication
- **LayerZero Integration**: Full OApp (Omnichain Application) implementation

## 📁 Project Structure

```
cross-chain-ping-pong/
├── evm/                          # Ethereum smart contracts
│   ├── contracts/
│   │   ├── PingPongEVM.sol      # Main EVM game contract
│   │   ├── interfaces/
│   │   └── MockEndpoint.sol     # Testing utilities
│   ├── scripts/                 # Deployment and interaction scripts
│   ├── test/                    # Contract tests
│   └── hardhat.config.ts        # Hardhat configuration
├── svm/                         # Solana program
│   └── pingpong/
│       ├── programs/pingpong/   # Anchor program source
│       ├── scripts/             # Deployment and interaction scripts
│       ├── tests/               # Program tests
│       └── Anchor.toml          # Anchor configuration
└── README.md
```

## 🛠️ Technical Stack

### Ethereum Side
- **Framework**: Hardhat + TypeScript
- **Smart Contract**: Solidity 0.8.22
- **LayerZero**: OApp V2 integration
- **Network**: Sepolia Testnet (EID: 40161)

### Solana Side
- **Framework**: Anchor
- **Program**: Rust
- **LayerZero**: Solana SDK V2
- **Network**: Devnet (EID: 40168)

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Rust & Cargo
- Solana CLI
- Anchor CLI
- Git

### 1. Clone Repository
```bash
git clone https://github.com/0xkinley/cross-chain-ping-pong.git
cd cross-chain-ping-pong
```

### 2. EVM Setup (Ethereum)
```bash
cd evm
npm install
cp .env.example .env
# Configure your .env file with private keys and RPC URLs
```

### 3. Solana Setup
```bash
cd ../svm/pingpong
npm install
anchor build --arch sbf
```

## 🎮 Game Mechanics

1. **Game Initialization**: Deploy contracts on both chains
2. **Peer Configuration**: Set up cross-chain communication peers
3. **Game Serving**: Start the game by serving the ball from either chain
4. **Cross-Chain Rally**: Ball travels between chains, incrementing value
5. **Rally Counting**: Each successful cross-chain exchange increases rally count
6. **Game Completion**: Game ends when maximum rallies are reached

## 🌐 Deployed Contracts

### Ethereum (Sepolia)
- **Contract Address**: `0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365`
- **LayerZero Endpoint**: `0x6EDCE65403992e310A62460808c4b910D972f10f`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x55D59591773CBdC4a3dc5e38E8Ef1cE85C7Ff365)

### Solana (Devnet)
- **Program ID**: `Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF`
- **Game PDA**: `Dz5yBVXHez3vQ8uypCReiX6ufLtvNcLfdrp5hAGxJLHv`
- **LayerZero Endpoint**: `76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6`
- **Explorer**: [View on Solscan](https://solscan.io/account/Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF?cluster=devnet)

## 🎯 Quick Start

### Serve the Game (EVM → Solana)
```bash
cd evm
npx hardhat run scripts/serve.ts --network sepolia
```

### Send Ball (Solana → EVM)
```bash
cd svm/pingpong
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
ANCHOR_WALLET=~/.config/solana/id.json \
ts-node scripts/send-ball-to-evm.ts
```

### Check Game State
```bash
# Ethereum
cd evm
npx hardhat run scripts/verify-deployment.ts --network sepolia

# Solana
cd svm/pingpong
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
ANCHOR_WALLET=~/.config/solana/id.json \
ts-node scripts/checkGameAccount.ts
```

## 📊 Monitoring & Debugging

- **LayerZero Scan**: Track cross-chain messages at [layerzeroscan.com](https://layerzeroscan.com)
- **Ethereum Explorer**: Monitor EVM transactions on [Sepolia Etherscan](https://sepolia.etherscan.io)
- **Solana Explorer**: Track Solana transactions on [Solscan Devnet](https://solscan.io/?cluster=devnet)

## 🔍 Key Scripts

### Ethereum Scripts
- `serve.ts` - Initialize and serve the game
- `set-peer-to-game-pda.ts` - Configure Solana peer
- `verify-deployment.ts` - Check contract state
- `set-enforced-options.ts` - Configure LayerZero options

### Solana Scripts
- `initGameSDK.ts` - Initialize game account
- `setPeerConfigSDK.ts` - Configure Ethereum peer
- `send-ball-to-evm.ts` - Send ball to Ethereum
- `checkGameAccount.ts` - Verify game state
- `callRegisterOAppWithAccounts.ts` - Register with LayerZero

## 🧪 Testing

### Run EVM Tests
```bash
cd evm
npx hardhat test
```

### Run Solana Tests
```bash
cd svm/pingpong
anchor test
```

## 🚨 Troubleshooting

### Common Issues

1. **"Game already active"**: Game was previously served, check game state
2. **"Insufficient fee"**: Increase gas/SOL for cross-chain transactions
3. **"Invalid peer"**: Ensure peer addresses are correctly configured
4. **"Account already exists"**: Program/contract already deployed

### Debug Commands
```bash
# Check peer configuration
npx hardhat run scripts/debug-layerzero.ts --network sepolia

# Verify LayerZero registration
ts-node scripts/callRegisterOAppWithAccounts.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LayerZero Labs](https://layerzero.network/) for cross-chain infrastructure
- [Anchor Framework](https://anchor-lang.com/) for Solana development
- [Hardhat](https://hardhat.org/) for Ethereum development

