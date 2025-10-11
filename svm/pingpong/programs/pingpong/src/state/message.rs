use anchor_lang::prelude::*;

// Message format to match EVM's abi.encode(uint256, uint256)
// The EVM side encodes as: abi.encode(_ballValue, _rallyCount)
#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct PingPongMessage {
    pub ball_value: u128,   // Using u128 instead of EVM's uint256 - still fits 1e20
    pub rally_count: u64,   // Using u64 instead of EVM's uint256 - plenty for rally counting
}

impl PingPongMessage {
    pub fn new(ball_value: u128, rally_count: u64) -> Self {
        Self {
            ball_value,
            rally_count,
        }
    }

    // Encode message to match EVM's abi.encode format
    pub fn encode(&self) -> Vec<u8> {
        // Need to match EVM's encoding exactly for LayerZero cross-chain compatibility
        // EVM's abi.encode(uint256, uint256) produces 64 bytes total
        let mut encoded = Vec::with_capacity(64);
        
        // First 32 bytes: ball_value (big-endian like EVM)
        let ball_value_bytes = self.ball_value.to_be_bytes();
        encoded.extend_from_slice(&[0u8; 16]); // Pad u128 to 32 bytes
        encoded.extend_from_slice(&ball_value_bytes);
        
        // Next 32 bytes: rally_count (big-endian like EVM)
        let rally_count_bytes = self.rally_count.to_be_bytes();
        encoded.extend_from_slice(&[0u8; 24]); // Pad u64 to 32 bytes
        encoded.extend_from_slice(&rally_count_bytes);
        
        encoded
    }

    // Decode message from EVM's abi.encode format
    pub fn decode(data: &[u8]) -> Result<Self> {
        if data.len() != 64 {
            return Err(ProgramError::InvalidInstructionData.into());
        }

        // Get ball_value from first 32 bytes
        let ball_value_bytes = &data[16..32]; // Skip padding, get the u128 part
        let ball_value = u128::from_be_bytes(
            ball_value_bytes.try_into()
                .map_err(|_| ProgramError::InvalidInstructionData)?
        );

        // Get rally_count from second 32 bytes
        let rally_count_bytes = &data[56..64]; // Skip padding, get the u64 part
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