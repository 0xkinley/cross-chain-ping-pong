use anchor_lang::prelude::*;

pub const ENFORCED_OPTIONS_SEND_MAX_LEN: usize = 512;

#[account]
pub struct PeerConfig {
    pub peer_address: [u8; 32],
    pub enforced_options: EnforcedOptions,
    pub bump: u8,
}

impl PeerConfig {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}

#[derive(Clone, Default, AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct EnforcedOptions {
    #[max_len(ENFORCED_OPTIONS_SEND_MAX_LEN)]
    pub send: Vec<u8>,
}

impl EnforcedOptions {
    pub fn combine_options(
        &self,
        extra_options: &Vec<u8>,
    ) -> Result<Vec<u8>> {
        let enforced_options = self.send.clone();
        oapp::options::combine_options(enforced_options, extra_options)
            .map_err(|_| anchor_lang::error::Error::from(anchor_lang::error::ErrorCode::ConstraintRaw))
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SetPeerConfigParams {
    pub remote_eid: u32,
    pub config: PeerConfigParam,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub enum PeerConfigParam {
    PeerAddress([u8; 32]),
    EnforcedOptions { send: Vec<u8> },
}