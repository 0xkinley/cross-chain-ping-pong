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

    event MessageSent(uint32 indexed dstEid, bytes message, bytes options);


    function send(
        ILayerZeroEndpoint.SendParam calldata _sendParam
    ) external {
        emit MessageSent(_sendParam.dstEid, _sendParam.message, _sendParam.options);
    }
}