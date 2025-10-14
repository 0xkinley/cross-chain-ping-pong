use anchor_lang::prelude::*;

#[account]
pub struct GameState {
    pub admin: Pubkey,
    pub bump: u8,
    pub endpoint_program: Pubkey,
    
    pub ball_value: u128,       
    pub rally_count: u64,       
    pub max_rallies: u64,       
    pub has_ball: bool,
    pub game_active: bool,
    pub paused: bool,
    
    pub remote_eid: u32,
    
    pub last_received_nonce: u64,
}

impl GameState {
    pub const SIZE: usize = 8 + 120;
}

#[account]
pub struct LzReceiveTypesAccounts {
    pub game: Pubkey,
}

impl LzReceiveTypesAccounts {
    pub const SIZE: usize = 8 + 32;
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InitGameParams {
    pub admin: Pubkey,
    pub endpoint: Pubkey,
    pub remote_eid: u32,
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