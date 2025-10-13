# Scripts Directory

This directory contains the essential scripts for the Cross-Chain Ping Pong LayerZero OApp.

## Available Scripts

### Core Functionality
- **`initGameSDK.ts`** - Initialize the game using LayerZero SDK
- **`setPeerConfig.ts`** - Configure peer chain settings (basic version)
- **`setPeerConfigSDK.ts`** - Configure peer chain settings using LayerZero SDK
- **`callRegisterOAppWithAccounts.ts`** - Register OApp with LayerZero endpoint (with required accounts)

### LayerZero Integration
- **`registerOAppSDK.ts`** - Register OApp using LayerZero SDK methods
- **`send-ball-to-evm.ts`** - Send ball to EVM chain (cross-chain messaging)

### Utilities
- **`checkGameAccount.ts`** - Check game account status and configuration
- **`verify-deployment.ts`** - Verify program deployment status

## Usage

Run any script with:
```bash
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com ANCHOR_WALLET=~/.config/solana/id.json npx tsx scripts/<script-name>
```

## Environment Variables Required
- `ANCHOR_PROVIDER_URL` - Solana RPC endpoint (e.g., https://api.devnet.solana.com)
- `ANCHOR_WALLET` - Path to your Solana wallet (e.g., ~/.config/solana/id.json)