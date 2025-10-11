use anchor_lang::prelude::*;
use crate::{
    state::GameState,
    constants::GAME_STATE_SEED,
    error::PingPongError,
};

#[derive(Accounts)]
pub struct ResumeGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GAME_STATE_SEED],
        bump = game.bump,
        has_one = admin @ PingPongError::NotAuthorised,
        constraint = game.game_active == false @ PingPongError::GameNotPaused
    )]
    pub game: Account<'info, GameState>,
}

impl ResumeGame<'_> {
    pub fn apply(ctx: &mut Context<ResumeGame>) -> Result<()> {
        ctx.accounts.game.game_active = true;
        msg!("Game resumed");
        Ok(())
    }
}