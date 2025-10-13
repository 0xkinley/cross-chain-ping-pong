use anchor_lang::prelude::*;
use crate::{
    state::game_state::{GameState, LzReceiveTypesAccounts, InitGameParams},
    constants::{LZ_RECEIVE_TYPES_SEED, GAME_STATE_SEED, MAX_RALLIES_CAP}
};

// Temporarily commented out for basic testing
// use oapp::endpoint::{instructions::RegisterOAppParams, ID as ENDPOINT_ID};

#[derive(Accounts)]
#[instruction(params: InitGameParams)]
pub struct InitGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        seeds = [GAME_STATE_SEED],
        bump,
        space = GameState::SIZE,
    )]
    pub game: Account<'info, GameState>,

    #[account(
        init,
        payer = payer,
        space = LzReceiveTypesAccounts::SIZE,
        seeds = [LZ_RECEIVE_TYPES_SEED, GAME_STATE_SEED],
        bump
    )]
    pub lz_receive_types_accounts: Account<'info, LzReceiveTypesAccounts>,

    pub system_program: Program<'info, System>,
}

impl InitGame<'_> {
    pub fn apply(ctx: &mut Context<InitGame>, params: &InitGameParams) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        // Required LayerZero fields
        game.admin = params.admin;
        game.bump = ctx.bumps.game;
        game.endpoint_program = params.endpoint;
        
        // Game initialization
        game.ball_value = 0;
        game.rally_count = 0;
        game.max_rallies = MAX_RALLIES_CAP;
        game.has_ball = false;
        game.game_active = false;
        game.paused = false;
        game.remote_eid = params.remote_eid;
        game.last_received_nonce = 0;

        ctx.accounts.lz_receive_types_accounts.game = game.key();
        
        // TODO: Register with LayerZero Endpoint
        // This will be implemented in a separate instruction to avoid circular dependencies
        // Temporarily commented out to test basic functionality
        /*
        let register_params = RegisterOAppParams { delegate: Pubkey::new_from_array(game.admin.to_bytes()) };
        let seeds: &[&[u8]] = &[GAME_STATE_SEED, &[game.bump]];

        oapp::endpoint_cpi::register_oapp(
            ENDPOINT_ID,
            Pubkey::new_from_array(game.key().to_bytes()),
            &ctx.remaining_accounts.iter().map(|acc| acc.to_account_info().to_account_info()).collect::<Vec<AccountInfo>>(),
            seeds,
            register_params,
        )?;
        */
        
        msg!("Ping-Pong store initialized");
        Ok(())
    }
}