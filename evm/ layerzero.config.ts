import { EndpointId } from '@layerzerolabs/lz-definitions'
import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'

// Solana testnet contract with your program ID
const solanaContract: OmniPointHardhat = {
    eid: EndpointId.SOLANA_V2_TESTNET,
    contractName: 'PingPong',
    address: 'Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF',
}

// EVM testnet contract (deploy this first and update the address)
const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'PingPongEVM',
    address: '0x7271592d027fc1055F7E13f8947a1D5CBc8Aed10', 
}

// Optional: Add more EVM testnets
const fujiContract: OmniPointHardhat = {
    eid: EndpointId.AVALANCHE_V2_TESTNET,
    contractName: 'PingPongEVM',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: solanaContract,
        },
        {
            contract: sepoliaContract,
        },
    ],
    connections: [
        // Solana to Sepolia
        {
            from: solanaContract,
            to: sepoliaContract,
            config: {
                sendLibrary: '0x0000000000000000000000000000000000000000', // Uses default
                receiveLibraryConfig: {
                    receiveLibrary: '0x0000000000000000000000000000000000000000', // Uses default
                    gracePeriod: 0n,
                },
                sendConfig: {
                    executorConfig: {
                        maxMessageSize: 10000,
                        executor: '0x0000000000000000000000000000000000000000', // Uses default
                    },
                    ulnConfig: {
                        confirmations: 1n, // Testnet - can use 1 confirmation
                        requiredDVNs: [], // Will use default testnet DVNs
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1n,
                        requiredDVNs: [], // Will use default testnet DVNs
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                enforcedOptions: [
                    {
                        msgType: 1, // SEND_BALL from your constants
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 200000, // Gas for EVM execution
                        value: 0,
                    },
                ],
            },
        },
        // Sepolia to Solana
        {
            from: sepoliaContract,
            to: solanaContract,
            config: {
                sendLibrary: '0x0000000000000000000000000000000000000000',
                receiveLibraryConfig: {
                    receiveLibrary: '0x0000000000000000000000000000000000000000',
                    gracePeriod: 0n,
                },
                sendConfig: {
                    executorConfig: {
                        maxMessageSize: 10000,
                        executor: '0x0000000000000000000000000000000000000000',
                    },
                    ulnConfig: {
                        confirmations: 1n,
                        requiredDVNs: [],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1n,
                        requiredDVNs: [],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                enforcedOptions: [
                    {
                        msgType: 1, // SEND_BALL
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 1000000, // Higher gas for Solana (compute units)
                        value: 0,
                    },
                ],
            },
        },
    ],
}

export default config