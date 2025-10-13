use anchor_lang::prelude::*;
use crate::{
    state::{GameState, PeerConfig, SendBallParams},
    constants::{GAME_STATE_SEED, PEER_SEED},
    error::PingPongError,
    PingPongMessage,
};
use oapp::endpoint::{instructions::SendParams, state::EndpointSettings, ENDPOINT_SEED, ID as ENDPOINT_ID};

#[derive(Accounts)]
#[instruction(params: SendBallParams)]
pub struct SendBall<'info> {
    #[account(
        mut, 
        seeds = [GAME_STATE_SEED], 
        bump = game.bump
    )]
    pub game: Account<'info, GameState>,

    #[account(
        seeds = [PEER_SEED, &game.key().to_bytes(), &params.dst_eid.to_be_bytes()],
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

impl<'info> SendBall<'info> {
    pub fn apply(ctx: &mut Context<SendBall>, params: &SendBallParams) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(!game.paused, PingPongError::GamePaused);
        require!(game.has_ball, PingPongError::DoesNotHaveBall);
        require!(params.ball_value > 0, PingPongError::BallValueZero);
        
        let msg = PingPongMessage::new(params.ball_value, game.rally_count);
        let message = msg.encode();
        let seeds: &[&[u8]] = &[GAME_STATE_SEED, &[game.bump]];

        let send_params = SendParams {
            dst_eid: params.dst_eid,
            receiver: ctx.accounts.peer.peer_address,
            message,
            options: ctx.accounts.peer.enforced_options.combine_options(&params.options)?,
            native_fee: params.native_fee,
            lz_token_fee: 0,
        };
        
        oapp::endpoint_cpi::send(
            ENDPOINT_ID,
            ctx.accounts.game.key(),
            ctx.remaining_accounts,
            seeds,
            send_params,
        )?;
        
        ctx.accounts.game.has_ball = false;
        msg!("Ball sent: value={}", params.ball_value);
        
        Ok(())
    }
}
