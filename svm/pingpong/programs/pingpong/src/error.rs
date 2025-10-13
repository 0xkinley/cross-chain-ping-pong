use anchor_lang::prelude::*;

#[error_code]
pub enum PingPongError {
    #[msg("Game is already active")]
    GameAlreadyActive,
    
    #[msg("Game is not active")]
    GameNotActive,
    
    #[msg("Invalid max rallies")]
    InvalidMaxRallies,
    
    #[msg("Max rallies reached")]
    MaxRalliesReached,
    
    #[msg("No ball to serve")]
    NoBallToServe,
    
    #[msg("Already has ball")]
    AlreadyHasBall,

    #[msg("Game is not Paused")]
    GameNotPaused,

    #[msg("Invalid peer")]
    InvalidPeer,
    
    #[msg("Insufficient balance")]
    InsufficientBalance,
    
    #[msg("Ball value is zero")]
    BallValueZero,
    
    #[msg("Invalid message")]
    InvalidMessage,
    
    #[msg("Message already processed")]
    MessageAlreadyProcessed,

    #[msg("Does not have ball")]
    DoesNotHaveBall,
    #[msg("Game is paused")]
    GamePaused,

    #[msg("Not authorised")]
    NotAuthorised,
    #[msg("Ball value underflow")]
    BallValueUnderflow,
    #[msg("Ball value too high")]
    BallValueTooHigh,
    #[msg("Exceeded maximum allowed rallies")]
    MaxRalliesExceeded
}
