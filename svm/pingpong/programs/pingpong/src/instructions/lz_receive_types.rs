use anchor_lang::prelude::*;
use crate::{
    state::GameState,
    constants::{GAME_STATE_SEED, PEER_SEED},
};
use oapp::endpoint_cpi::{get_accounts_for_clear, LzAccount};
use oapp::{endpoint::ID as ENDPOINT_ID, LzReceiveParams};

#[derive(Accounts)]
pub struct LzReceiveTypes<'info> {
    #[account(
        seeds = [GAME_STATE_SEED], 
        bump = game.bump
    )]
    pub game: Account<'info, GameState>,
}

impl LzReceiveTypes<'_> {
    pub fn apply(
        ctx: &Context<LzReceiveTypes>,
        params: &LzReceiveParams,
    ) -> Result<Vec<LzAccount>> {
        let game = ctx.accounts.game.key();

        let peer_seeds = [PEER_SEED, &game.to_bytes(), &params.src_eid.to_be_bytes()];
        let (peer, _) = Pubkey::find_program_address(&peer_seeds, ctx.program_id);
        
        let mut accounts = vec![
            LzAccount { pubkey: game, is_signer: false, is_writable: true },
            LzAccount { pubkey: peer, is_signer: false, is_writable: false },
        ];
        
        let accounts_for_clear = get_accounts_for_clear(
            ENDPOINT_ID,
            &game,
            params.src_eid,
            &params.sender,
            params.nonce,
        );
        
        accounts.extend(accounts_for_clear);
        Ok(accounts)
    }
}