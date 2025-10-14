use anchor_lang::prelude::*;

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct PingPongMessage {
    pub ball_value: u128,  
    pub rally_count: u64,  
}

impl PingPongMessage {
    pub fn new(ball_value: u128, rally_count: u64) -> Self {
        Self {
            ball_value,
            rally_count,
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        let mut encoded = Vec::with_capacity(64);
        
        let ball_value_bytes = self.ball_value.to_be_bytes();
        encoded.extend_from_slice(&[0u8; 16]);
        encoded.extend_from_slice(&ball_value_bytes);
        
        let rally_count_bytes = self.rally_count.to_be_bytes();
        encoded.extend_from_slice(&[0u8; 24]);
        encoded.extend_from_slice(&rally_count_bytes);
        
        encoded
    }

    pub fn decode(data: &[u8]) -> Result<Self> {
        if data.len() != 64 {
            return Err(ProgramError::InvalidInstructionData.into());
        }

        let ball_value_bytes = &data[16..32];
        let ball_value = u128::from_be_bytes(
            ball_value_bytes.try_into()
                .map_err(|_| ProgramError::InvalidInstructionData)?
        );

        let rally_count_bytes = &data[56..64];
        let rally_count = u64::from_be_bytes(
            rally_count_bytes.try_into()
                .map_err(|_| ProgramError::InvalidInstructionData)?
        );

        Ok(Self {
            ball_value,
            rally_count,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_encoding_decoding() {
        let original = PingPongMessage::new(100_000_000_000_000_000_000u128, 42u64);
        let encoded = original.encode();
        let decoded = PingPongMessage::decode(&encoded).unwrap();
        
        assert_eq!(original.ball_value, decoded.ball_value);
        assert_eq!(original.rally_count, decoded.rally_count);
        assert_eq!(encoded.len(), 64); 
    }
}