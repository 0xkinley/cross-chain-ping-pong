// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface ILayerZeroEndpoint {
    struct SendParam {
        uint32  dstEid;
        bytes32 to;
        bytes   message;
        bytes   options;
        bool    payInLzToken;
    }

    struct MessagingFee {
        uint256 nativeFee;
        uint256 lzTokenFee;
    }
}

contract MockEndpoint {
    // ========================================
    // EVENTS
    // ========================================

    event MessageSent(uint32 indexed dstEid, bytes message, bytes options);

    // ========================================
    // EXTERNAL FUNCTIONS
    // ========================================

    function send(
        ILayerZeroEndpoint.SendParam calldata _sendParam,
        address                              /* _refundAddress */
    ) external payable returns (bytes32) {
        emit MessageSent(_sendParam.dstEid, _sendParam.message, _sendParam.options);
        return bytes32(uint256(1));
    }

    function quote(
        ILayerZeroEndpoint.SendParam calldata /* _sendParam */,
        bool                                  /* _payInLzToken */
    ) external pure returns (ILayerZeroEndpoint.MessagingFee memory) {
        return ILayerZeroEndpoint.MessagingFee({
            nativeFee:  0.001 ether,
            lzTokenFee: 0
        });
    }

    function setDelegate(address /* _delegate */) external {}
}