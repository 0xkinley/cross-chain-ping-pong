import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities';
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat';
import { EndpointId } from '@layerzerolabs/lz-definitions';
import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools';

// Sepolia EVM contract
export const sepoliaContract: OmniPointHardhat = {
  eid: EndpointId.SEPOLIA_V2_TESTNET,
  contractName: 'PingPongEVM',
  address: '0x7271592d027fc1055F7E13f8947a1D5CBc8Aed10',
};

// Solana testnet contract - address is required for Solana
export const solanaContract: OmniPointHardhat = {
  eid: EndpointId.SOLANA_V2_TESTNET,
  address: 'Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF', // Your program ID
};

// EVM enforced options for receiving messages
const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1, // SEND_BALL message type
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 200000, // Gas limit for EVM execution
    value: 0,
  },
];

// Solana enforced options for receiving messages
const SOLANA_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1, // SEND_BALL message type
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 1000000, // Higher compute units for Solana
    value: 0, // No rent needed for ping-pong messages
  },
];

export default async function () {
  // Generate connections using the Simple Config approach
  // Note: connections are automatically bidirectional
  const connections = await generateConnectionsConfig([
    [
      sepoliaContract,           // EVM contract
      solanaContract,            // Solana contract
      [['LayerZero Labs'], []],  // Use default DVN (LayerZero Labs) for testnet
      [1, 1],                    // Block confirmations: [EVM->Solana, Solana->EVM]
      [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS], // Enforced options for each direction
    ],
  ]);
  
  return {
    contracts: [{ contract: sepoliaContract }, { contract: solanaContract }],
    connections,
  };
}