// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./PingPongEVM.sol";

contract PingPongEVMTester is PingPongEVM {
    // ========================================
    // CONSTRUCTOR
    // ========================================

    constructor(
        address _endpoint,
        uint32  _peerEid,
        address _owner
    ) PingPongEVM(_endpoint, _peerEid, _owner) {}

    // ========================================
    // TEST FUNCTIONS
    // ========================================

    function testLzReceive(
        Origin calldata _origin,
        bytes32         _guid,
        bytes calldata  _message,
        address         _executor,
        bytes calldata  _extraData
    ) external {
        _lzReceive(_origin, _guid, _message, _executor, _extraData);
    }
}