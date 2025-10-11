// Game Constants - MUST MATCH EVM CONTRACT EXACTLY
pub const INITIAL_BALL_VALUE: u128 = 100_000_000_000_000_000_000u128; // 1e20 - matches EVM
pub const MAX_RALLIES_CAP: u64 = 100; // matches EVM MAX_RALLIES_CAP
pub const SEND_BALL_MSG_TYPE: u16 = 1; // matches EVM SEND_BALL constant

// PDA Seeds
pub const GAME_STATE_SEED: &[u8] = b"game_state";
pub const PEER_SEED: &[u8] = b"Peer";
pub const LZ_RECEIVE_TYPES_SEED: &[u8] = b"LzReceiveTypes"; // The Executor relies on this exact seed
