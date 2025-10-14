use anchor_lang::prelude::*;
use crate::{
    state::{GameState, PeerConfig },
    constants::{GAME_STATE_SEED, PEER_SEED, INITIAL_BALL_VALUE},
    error::PingPongError,
    PingPongMessage
};
use oapp::endpoint::{
    state::EndpointSettings,
    cpi::accounts::Clear, 
    instructions::ClearParams, 
    ConstructCPIContext, 
    ENDPOINT_SEED,
    ID as ENDPOINT_ID
};
use oapp::LzReceiveParams;

#[derive(Accounts)]
#[instruction(params: LzReceiveParams)]
pub struct LzReceive<'info> {
    #[account(
        mut, 
        seeds = [GAME_STATE_SEED], 
        bump = game.bump
    )]
    pub game: Account<'info, GameState>,
    
    #[account(
        seeds = [PEER_SEED, &game.key().to_bytes(), &params.src_eid.to_be_bytes()],
        bump = peer.bump,
        constraint = params.sender == peer.peer_address @ PingPongError::GameNotActive
    )]
    pub peer: Account<'info, PeerConfig>,

    #[account(
        seeds = [ENDPOINT_SEED], 
        bump = endpoint.bump, 
        seeds::program = ENDPOINT_ID
    )]
    pub endpoint: Account<'info, EndpointSettings>,
}

impl LzReceive<'_> {

    pub fn apply(ctx: &mut Context<LzReceive>, params: &LzReceiveParams) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(!game.paused, PingPongError::GamePaused);
        
        let seeds: &[&[u8]] = &[GAME_STATE_SEED, &[game.bump]];
        let accounts_for_clear = &ctx.remaining_accounts[0..Clear::MIN_ACCOUNTS_LEN];
        
        oapp::endpoint_cpi::clear(
            ENDPOINT_ID,
            game.key(),
            accounts_for_clear,
            seeds,
            ClearParams {
                receiver: game.key(),
                src_eid: params.src_eid,
                sender: params.sender,
                nonce: params.nonce,
                guid: params.guid,
                message: params.message.clone(),
            },
        )?;
        
        let received_msg = PingPongMessage::decode(&params.message)?;

        
        msg!("Ball received: value={}, rally={}", received_msg.ball_value, received_msg.rally_count);
        
        require!(received_msg.ball_value > 0, PingPongError::BallValueZero);
        require!(
            received_msg.ball_value <= INITIAL_BALL_VALUE as u128,
            PingPongError::BallValueTooHigh
        );
        
        let new_value = received_msg.ball_value
            .checked_sub(1)
            .ok_or(PingPongError::BallValueUnderflow)?;
        
        game.ball_value = new_value;
        game.rally_count = game.rally_count.checked_add(1).unwrap_or(u64::MAX);
        game.has_ball = true;
        game.game_active = true;
        
        require!(
            game.rally_count <= crate::constants::MAX_RALLIES_CAP,
            PingPongError::MaxRalliesExceeded
        );
        
        msg!(
            "Decremented ball: new_value={}, rally_count={}",
            new_value,
            game.rally_count
        );
        
        if new_value == 0 {
            game.game_active = false;
            game.has_ball = false;
            msg!("GAME OVER! Final rally count: {}", game.rally_count);
        } 

        if game.rally_count >= game.max_rallies {
            game.game_active = false;
            game.has_ball = false;
            msg!("GAME OVER! Max rallies reached: {}", game.rally_count);
            return Ok(());
        }
        
        Ok(())
    }
}
