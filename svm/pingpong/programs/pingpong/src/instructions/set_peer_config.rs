use anchor_lang::prelude::*;
use crate::{
    state::{
        peer_config::{PeerConfig, SetPeerConfigParams, PeerConfigParam}, 
        game_state::GameState},
    constants::{PEER_SEED, GAME_STATE_SEED},
    error::PingPongError,
};


#[derive(Accounts)]
#[instruction(params: SetPeerConfigParams)]
pub struct SetPeerConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = admin,
        space = PeerConfig::SIZE,
        seeds = [PEER_SEED, &game.key().to_bytes(), &params.remote_eid.to_be_bytes()],
        bump
    )]
    pub peer: Account<'info, PeerConfig>,

    #[account(
        seeds = [GAME_STATE_SEED],
        bump,
        has_one = admin @ PingPongError::NotAuthorised
    )]
    pub game: Account<'info, GameState>,
    
    pub system_program: Program<'info, System>,
}

impl SetPeerConfig<'_> {
    pub fn apply(ctx: &mut Context<SetPeerConfig>, params: &SetPeerConfigParams) -> Result<()> {
        let peer = &mut ctx.accounts.peer;
        
        match params.config.clone() {
            PeerConfigParam::PeerAddress(peer_address) => {
                peer.peer_address = peer_address;
                msg!("Peer address set");
            },
            PeerConfigParam::EnforcedOptions { send } => {
                oapp::options::assert_type_3(&send)
                    .map_err(|_e| anchor_lang::prelude::ProgramError::Custom(6000))?;
                peer.enforced_options.send = send;
                msg!("Enforced options set");
            },
        }
        
        peer.bump = ctx.bumps.peer;
        Ok(())
    }
}

