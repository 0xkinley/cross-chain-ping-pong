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
        bump 
    )]
    pub game: Account<'info, GameState>,

}

pub fn register_oapp<'info>(ctx: Context<'_, '_, '_, 'info, RegisterOApp<'info>>) -> Result<()> {
    // Prepare the delegate address for the OApp registration (following official example)
    let params = RegisterOAppParams { delegate: ctx.accounts.game.admin };
    msg!("Registering oApp with LayerZero Endpoint");
    
    // The Game PDA 'signs' CPI to the Endpoint program to register the OApp (like Store PDA in official example)
    let seeds: &[&[u8]] = &[GAME_STATE_SEED, &[ctx.accounts.game.bump]];
    msg!("Using seeds: {:?}", seeds);
    
    msg!("Total remaining accounts: {}", ctx.remaining_accounts.len());
    for (i, account) in ctx.remaining_accounts.iter().enumerate() {
        msg!("Remaining Account {}: {} (writable: {}, signer: {})", 
             i, account.key, account.is_writable, account.is_signer);
    }

    msg!("Expect ENDPOINT_ID: {}", ENDPOINT_ID);
    for (i, acc) in ctx.remaining_accounts.iter().enumerate() {
        msg!("rem[{}] = {} (w={}, s={})", i, acc.key, acc.is_writable, acc.is_signer);
    }

    // Following the official LayerZero example pattern exactly - pass remaining_accounts directly
    oapp::endpoint_cpi::register_oapp(
        ENDPOINT_ID,
        ctx.accounts.game.key(),
        ctx.remaining_accounts,
        seeds,
        params,
    )?;

    Ok(())
}
