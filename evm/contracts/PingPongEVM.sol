// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IPingPong } from "./interfaces/IPingPong.sol";
import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppCore } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppCore.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PingPongEVM is IPingPong, OApp, OAppOptionsType3 {
    // ========================================
    // CONSTANTS
    // ========================================

    uint256 public constant INITIAL_BALL_VALUE = 1e20;
    uint16  public constant SEND_BALL = 1;
    uint256 public constant MAX_RALLIES_CAP = 100;

    // ========================================
    // IMMUTABLE VARIABLES
    // ========================================

    uint32 public immutable peerEid;

    // ========================================
    // STATE VARIABLES
    // ========================================

    uint256   public ballValue;
    uint256   public rallyCount;
    GameState public gameState;

    mapping(bytes32 => bool) private _processedGuid;

    // ========================================
    // CONSTRUCTOR
    // ========================================

    constructor(
        address _endpoint,
        uint32  _peerEid,
        address _owner
    ) OApp(_endpoint, _owner) Ownable(_owner) {
        peerEid = _peerEid;
    }

    // ========================================
    // PUBLIC FUNCTIONS
    // ========================================

    function quote(
        uint256        _ballValue,
        uint256        _rallyCount,
        bytes calldata _options,
        bool           _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory _message = _encodeMessage(_ballValue, _rallyCount);
        fee = _quote(peerEid, _message, combineOptions(peerEid, SEND_BALL, _options), _payInLzToken);
    }

    function serve(uint256 _maxRallies, bytes calldata _options) external payable {
        if (gameState.gameActive) revert GameAlreadyActive();
        if (_maxRallies == 0 || _maxRallies > MAX_RALLIES_CAP) revert InvalidMaxRallies();

        ballValue                = INITIAL_BALL_VALUE;
        rallyCount               = 0;
        gameState.maxRallies     = uint128(_maxRallies);
        gameState.hasBall        = true;
        gameState.gameActive     = true;

        emit GameStarted(ballValue, _maxRallies, block.timestamp);

        bytes memory _message = _encodeMessage(ballValue, rallyCount);

        bytes memory _combinedOptions = combineOptions(peerEid, SEND_BALL, _options);
        MessagingFee memory fee = _quote(peerEid, _message, _combinedOptions, false);
        emit FeeEstimated(fee.nativeFee, fee.lzTokenFee);

        if (msg.value < fee.nativeFee) revert InsufficientFee();

        bytes32 guid = _lzSend(
            peerEid,
            _message,
            _combinedOptions,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        ).guid;

        gameState.hasBall = false;
        emit BallServed(ballValue, rallyCount, guid);
    }

    function fund() external payable {
        if (msg.value == 0) revert InsufficientFee();
        emit ContractFunded(msg.sender, msg.value);
    }

    // ========================================
    // OWNER FUNCTIONS
    // ========================================

    function pauseGame() external onlyOwner {
        if (!gameState.gameActive) revert GameNotActive();
        gameState.gameActive = false;
        emit GameEnded(rallyCount, block.timestamp, "Paused by owner");
    }

    // ========================================
    // VIEW FUNCTIONS
    // ========================================

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ========================================
    // INTERNAL FUNCTIONS
    // ========================================

    function _lzReceive(
        Origin calldata _origin,
        bytes32         _guid,
        bytes calldata  _message,
        address         /* _executor */,
        bytes calldata  /* _extraData */
    ) internal override {
        if (_origin.srcEid != peerEid) revert InvalidPeer();

        if (_processedGuid[_guid]) return;
        _processedGuid[_guid] = true;

        GameState memory gs = gameState;
        (uint256 receivedValue, uint256 receivedRally) = abi.decode(_message, (uint256, uint256));

        // Auto-initialize game if not active
        if (!gs.gameActive) {
            if (gs.hasBall) revert AlreadyHasBall();
            _initializeGameFromPeer(receivedValue, receivedRally);
            return;
        }

        if (gs.hasBall) revert AlreadyHasBall();

        ballValue  = receivedValue;
        rallyCount = receivedRally + 1;
        gs.hasBall = true;
        gameState  = gs;

        emit BallReceived(ballValue, rallyCount, block.timestamp);

        // Check end conditions
        if (ballValue == 0) {
            gameState.gameActive = false;
            emit GameEnded(rallyCount, block.timestamp, "Ball reached 0");
            return;
        }

        if (rallyCount >= gs.maxRallies) {
            gameState.gameActive = false;
            emit GameEnded(rallyCount, block.timestamp, "Max rallies reached");
            return;
        }

        unchecked {
            ballValue = ballValue - 1;
        }

        _sendBack();
    }

    function _sendBack() internal {
        GameState memory gs = gameState;
        if (!gs.gameActive) revert GameNotActive();
        if (!gs.hasBall) revert NoBallToServe();
        if (rallyCount >= gs.maxRallies) revert MaxRalliesReached();

        bytes memory _message = _encodeMessage(ballValue, rallyCount);
        bytes memory _options = _combineOptionsEmpty();

        MessagingFee memory fee = _quote(peerEid, _message, _options, false);
        emit FeeEstimated(fee.nativeFee, fee.lzTokenFee);

        if (address(this).balance < fee.nativeFee) revert InsufficientContractBalance();

        (bool success, ) = payable(address(this)).call{value: fee.nativeFee}(
            abi.encodeWithSignature("_sendBackWithValue(bytes,bytes)", _message, _options)
        );
        if (!success) revert SelfCallFailed();

        gameState.hasBall = false;
    }

    function _sendBackWithValue(bytes memory _message, bytes memory _options) external payable {
        if (msg.sender != address(this)) revert OnlySelfCall();

        bytes32 guid = _lzSend(
            peerEid,
            _message,
            _options,
            MessagingFee(msg.value, 0),
            payable(address(this))
        ).guid;

        emit BallReturned(ballValue, rallyCount, guid);
    }

    // ========================================
    // RECEIVE & FALLBACK FUNCTIONS
    // ========================================

    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }

    fallback() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }

    // ========================================
    // OVERRIDE FUNCTIONS
    // ========================================

    function setPeer(uint32 _eid, bytes32 _peer) public override(IPingPong, OAppCore) onlyOwner {
        _setPeer(_eid, _peer);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert WithdrawFailed();
    }

    function _encodeMessage(uint256 _ballValue, uint256 _rallyCount) internal pure returns (bytes memory) {
        return abi.encode(_ballValue, _rallyCount);
    }

    function _combineOptionsEmpty() internal view returns (bytes memory) {
        return enforcedOptions[peerEid][SEND_BALL];
    }

    function _initializeGameFromPeer(uint256 receivedValue, uint256 receivedRally) internal {
        ballValue                = receivedValue;
        rallyCount               = receivedRally + 1;
        gameState.maxRallies     = uint128(MAX_RALLIES_CAP);
        gameState.hasBall        = true;
        gameState.gameActive     = true;

        emit GameStarted(ballValue, MAX_RALLIES_CAP, block.timestamp);
        emit BallReceived(ballValue, rallyCount, block.timestamp);

        if (ballValue == 0) {
            gameState.gameActive = false;
            emit GameEnded(rallyCount, block.timestamp, "Ball reached 0");
            return;
        }

        if (rallyCount >= MAX_RALLIES_CAP) {
            gameState.gameActive = false;
            emit GameEnded(rallyCount, block.timestamp, "Max rallies reached");
            return;
        }

        unchecked {
            ballValue = ballValue - 1;
        }

        _sendBack();
    }

    // ========================================
    // GETTER FUNCTIONS
    // ========================================

    function hasBall() external view returns (bool) {
        return gameState.hasBall;
    }

    function gameActive() external view returns (bool) {
        return gameState.gameActive;
    }

    function maxRallies() external view returns (uint256) {
        return gameState.maxRallies;
    }
}
