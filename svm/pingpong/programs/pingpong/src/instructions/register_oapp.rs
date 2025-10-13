use anchor_lang::prelude::*;
use crate::state::game_state::GameState;
use oapp::endpoint::{instructions::RegisterOAppParams, ID as ENDPOINT_ID};
use crate::constants::GAME_STATE_SEED;

#[derive(Accounts)]
pub struct RegisterOApp<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_STATE_SEED],
        bump = game.bump
    )]
    pub game: Account<'info, GameState>,

    pub endpoint_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register_oapp(ctx: Context<RegisterOApp>) -> Result<()> {
    let params = RegisterOAppParams { delegate: ctx.accounts.game.admin };

    let bump = ctx.accounts.game.bump;
    let seeds: &[&[u8]] = &[b"game_state", &[bump]];

    let remaining_accounts: Vec<AccountInfo> = ctx.remaining_accounts.to_vec();


    oapp::endpoint_cpi::register_oapp(
        ENDPOINT_ID,
        ctx.accounts.game.key(),
        &remaining_accounts,  
        seeds,
        params,
    )?;

    Ok(())
}
