use anchor_lang::{
    system_program::*,
    prelude::*,
};

use crate::{
    state::GameState,
    constants::GAME_STATE_SEED,
};

#[derive(Accounts)]
pub struct FundContract<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,

    #[account(
        mut, 
        seeds = [GAME_STATE_SEED],
        bump = game.bump
    )]
    pub game: Account<'info, GameState>,

    pub system_program: Program<'info, System>,
}

impl FundContract<'_> {
    pub fn apply(ctx: &Context<FundContract>, amount: u64) -> Result<()> {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.funder.to_account_info(),
                    to: ctx.accounts.game.to_account_info(),
                },
            ),
            amount,
        )?;
        
        msg!("Contract funded with {} lamports", amount);
        Ok(())
    }
}

