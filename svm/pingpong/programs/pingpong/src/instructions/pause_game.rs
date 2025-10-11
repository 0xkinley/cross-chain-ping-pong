use anchor_lang::prelude::*;
use crate::{
    state::GameState,
    constants::GAME_STATE_SEED,
    error::PingPongError,
};

#[derive(Accounts)]
pub struct PauseGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GAME_STATE_SEED],
        bump = game.bump,
        has_one = admin @ PingPongError::NotAuthorised,
        constraint = game.game_active == true @ PingPongError::GameNotActive
    )]
    pub game: Account<'info, GameState>,
}

impl PauseGame<'_> {
    pub fn apply(ctx: &mut Context<PauseGame>) -> Result<()> {
        ctx.accounts.game.game_active = false;
        msg!("Game paused");
        Ok(())
    }
}