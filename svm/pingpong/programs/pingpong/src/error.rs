use anchor_lang::prelude::error_code;

#[error_code]
pub enum PingPongError {
    #[msg("Game is paused")]
    GamePaused,
    
    #[msg("Game is not active")]
    GameNotActive,

    #[msg("Game is not paused")]
    GameNotPaused,

    #[msg("Solana does not currently have the ball")]
    DoesNotHaveBall,
    
    #[msg("Ball value would underflow")]
    BallValueUnderflow,
    
    #[msg("Ball value cannot be zero")]
    BallValueZero,
    
    #[msg("Ball value exceeds maximum")]
    BallValueTooHigh,
    
    #[msg("Maximum rallies exceeded")]
    MaxRalliesExceeded,
    
    #[msg("Insufficient funds for message fee")]
    InsufficientFunds,

    #[msg("Not Authorised for the action")]
    NotAuthorised,
}