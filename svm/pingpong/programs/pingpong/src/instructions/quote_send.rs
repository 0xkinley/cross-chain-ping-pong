use anchor_lang::prelude::*;
use oapp::endpoint::{
    instructions::QuoteParams, 
    state::EndpointSettings, 
    MessagingFee,
    ENDPOINT_SEED, 
    ID as ENDPOINT_ID
};
use crate::{
    state::{GameState, QuoteSendParams, PeerConfig},
    constants::{GAME_STATE_SEED, PEER_SEED},
    PingPongMessage,
};

#[derive(Accounts)]
#[instruction(params: QuoteSendParams)]
pub struct QuoteSend<'info> {
    #[account(
        seeds = [GAME_STATE_SEED], 
        bump = game.bump
    )]
    pub game: Account<'info, GameState>,
    
    #[account(
        seeds = [PEER_SEED, game.key().as_ref(), &params.dst_eid.to_be_bytes()],
        bump = peer.bump
    )]
    pub peer: Account<'info, PeerConfig>,
    
    #[account(
        seeds = [ENDPOINT_SEED], 
        bump = endpoint.bump, 
        seeds::program = ENDPOINT_ID
    )]
    pub endpoint: Account<'info, EndpointSettings>,
}

impl<'info> QuoteSend<'info> {
    pub fn apply(ctx: &Context<QuoteSend>, params: &QuoteSendParams) -> Result<MessagingFee> {
        let msg = PingPongMessage::new(params.ball_value, ctx.accounts.game.rally_count);
        let message = msg.encode();
        
        let quote_params = QuoteParams {
            sender: ctx.accounts.game.key(),
            dst_eid: params.dst_eid,
            receiver: ctx.accounts.peer.peer_address,
            message,
            pay_in_lz_token: false,
            options: ctx.accounts.peer.enforced_options.combine_options(&params.options)?,
        };
        
        oapp::endpoint_cpi::quote(ENDPOINT_ID, ctx.remaining_accounts, quote_params)
    }
}