pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use oapp::{LzReceiveParams, endpoint_cpi::LzAccount, endpoint::MessagingFee};

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF");

#[program]
pub mod pingpong {
    use super::*;

    pub fn init_store(mut ctx: Context<InitGame>, params: InitGameParams) -> Result<()> {
        InitGame::apply(&mut ctx, &params)
    }

    pub fn set_peer_config(mut ctx: Context<SetPeerConfig>, params: SetPeerConfigParams) -> Result<()> {
        SetPeerConfig::apply(&mut ctx, &params)
    }

    pub fn pause_game(mut ctx: Context<PauseGame>) -> Result<()> {
        PauseGame::apply(&mut ctx)
    }

    pub fn resume_game(mut ctx: Context<ResumeGame>) -> Result<()> {
        ResumeGame::apply(&mut ctx)
    }

    pub fn fund_contract(ctx: Context<FundContract>, amount: u64) -> Result<()> {
        FundContract::apply(&ctx, amount)
    }

    pub fn quote_send(ctx: Context<QuoteSend>, params: QuoteSendParams) -> Result<MessagingFee> {
        QuoteSend::apply(&ctx, &params)
    }

    pub fn send_ball(mut ctx: Context<SendBall>, params: SendBallParams) -> Result<()> {
        SendBall::apply(&mut ctx, &params)
    }

    pub fn lz_receive(mut ctx: Context<LzReceive>, params: LzReceiveParams) -> Result<()> {
        LzReceive::apply(&mut ctx, &params)
    }

    pub fn lz_receive_types(ctx: Context<LzReceiveTypes>, params: LzReceiveParams) -> Result<Vec<LzAccount>> {
        LzReceiveTypes::apply(&ctx, &params)
    }

    pub fn close_game(ctx: Context<CloseGame>) -> Result<()> {
        CloseGame::apply(ctx)
    }

    pub fn register_oapp<'info>(ctx: Context<'_, '_, '_, 'info, RegisterOApp<'info>>) -> Result<()> {
        register_oapp::register_oapp(ctx)
    }
}
