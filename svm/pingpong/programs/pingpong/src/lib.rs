pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF");

#[program]
pub mod pingpong {
    use super::*;

    pub fn init_store(ctx: Context<InitStore>, params: InitGameParams) -> Result<()> {
        init_game::init_store(ctx, params)
    }

    pub fn set_peer_config(ctx: Context<SetPeerConfig>, params: SetPeerConfigParams) -> Result<()> {
        set_peer_config::set_peer_config(ctx, params)
    }

    pub fn pause_game(ctx: Context<PauseGame>) -> Result<()> {
        pause_game::pause_game(ctx)
    }

    pub fn resume_game(ctx: Context<ResumeGame>) -> Result<()> {
        resume_game::resume_game(ctx)
    }

    pub fn fund_contract(ctx: Context<FundContract>, amount: u64) -> Result<()> {
        fund_contract::fund_contract(ctx, amount)
    }

    pub fn quote_send(ctx: Context<QuoteSend>, params: QuoteSendParams) -> Result<MessagingFee> {
        quote_send::quote_send(ctx, params)
    }

    pub fn send_ball(ctx: Context<SendBall>, params: SendBallParams) -> Result<()> {
        send_ball::send_ball(ctx, params)
    }

    pub fn lz_receive(ctx: Context<LzReceive>, params: LzReceiveParams) -> Result<()> {
        lz_receive::lz_receive(ctx, params)
    }

    pub fn lz_receive_types(ctx: Context<LzReceiveTypes>, params: LzReceiveParams) -> Result<Vec<LzAccount>> {
        lz_receive_types::lz_receive_types(ctx, params)
    }

    pub fn close_game(ctx: Context<CloseGame>) -> Result<()> {
        close_game::close_game(ctx)
    }

    pub fn register_oapp(ctx: Context<RegisterOApp>) -> Result<()> {
        register_oapp::register_oapp(ctx)
    }
}
