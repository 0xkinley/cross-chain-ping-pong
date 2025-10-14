use anchor_lang::prelude::*;
use crate::{
    state::game_state::GameState,
    constants::{GAME_STATE_SEED, LZ_RECEIVE_TYPES_SEED},
    error::PingPongError,
};

#[derive(Accounts)]
pub struct CloseGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [GAME_STATE_SEED],
        bump = game.bump,
        has_one = admin @ PingPongError::NotAuthorised,
        close = admin
    )]
    pub game: Account<'info, GameState>,

   
    #[account(
        mut,
        seeds = [LZ_RECEIVE_TYPES_SEED, GAME_STATE_SEED],
        bump
    )]
    pub lz_receive_types_accounts: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl CloseGame<'_> {
    pub fn apply(ctx: Context<CloseGame>) -> Result<()> {
        let lz_account = &ctx.accounts.lz_receive_types_accounts;
        let admin = &ctx.accounts.admin;
        
        let lz_lamports = lz_account.lamports();
        **lz_account.try_borrow_mut_lamports()? -= lz_lamports;
        **admin.try_borrow_mut_lamports()? += lz_lamports;
        
        lz_account.assign(&System::id());
        lz_account.realloc(0, false)?;

        msg!("Game account and LZ types account closed, lamports returned to admin");
        Ok(())
    }
}