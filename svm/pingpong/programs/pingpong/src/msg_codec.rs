use anchor_lang::prelude::*;

#[error_code]
pub enum MsgCodecError {
    InvalidLength,
}

// Encode ball value as 16 bytes (little-endian u128)
pub fn encode(ball_value: u128) -> Vec<u8> {
    ball_value.to_le_bytes().to_vec()
}

// Decode 16-byte payload into u128
pub fn decode(message: &[u8]) -> Result<u128> {
    if message.len() != 16 {
        return Err(MsgCodecError::InvalidLength.into());
    }
    
    let mut bytes = [0u8; 16];
    bytes.copy_from_slice(&message[0..16]);
    Ok(u128::from_le_bytes(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_decode() {
        let value: u128 = 100;
        let encoded = encode(value);
        assert_eq!(encoded.len(), 16);
        
        let decoded = decode(&encoded).unwrap();
        assert_eq!(decoded, value);
    }

    #[test]
    fn test_encode_zero() {
        let value: u128 = 0;
        let encoded = encode(value);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(decoded, 0);
    }
}