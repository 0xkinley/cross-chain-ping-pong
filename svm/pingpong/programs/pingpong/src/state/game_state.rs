use anchor_lang::prelude::*;

#[account]
pub struct GameState {
    pub admin: Pubkey,
    pub bump: u8,
    pub endpoint_program: Pubkey,
    
    // Game state
    pub ball_value: u128,
    pub rally_count: u32,
    pub has_ball: bool,
    pub game_active: bool,
    pub paused: bool,
    
    // Remote chain endpoint ID (e.g., 40161 for Sepolia)
    pub remote_eid: u32,
}

impl GameState {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
    
    pub const INITIAL_BALL_VALUE: u128 = 100;
    pub const MAX_RALLIES: u32 = 200; // Circuit breaker
}

#[account]
pub struct LzReceiveTypesAccounts {
    pub game: Pubkey,
}

impl LzReceiveTypesAccounts {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InitGameParams {
    pub admin: Pubkey,
    pub endpoint: Pubkey,
    pub remote_eid: u32, // EVM chain endpoint ID (e.g., 40161 for Sepolia)
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct QuoteSendParams {
    pub dst_eid: u32,
    pub ball_value: u128,
    pub options: Vec<u8>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SendBallParams {
    pub dst_eid: u32,
    pub ball_value: u128,
    pub options: Vec<u8>,
    pub native_fee: u64,
}