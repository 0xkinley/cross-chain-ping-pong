// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

/**
 * @title IPingPong
 * @notice Complete interface for the cross-chain ping-pong game.
 * @dev Includes all errors, events, view functions, and external functions.
 */
interface IPingPong {
    // ========================================
    // STRUCTS
    // ========================================

    struct GameState {
        uint128 maxRallies;
        bool    hasBall;
        bool    gameActive;
    }

    // ========================================
    // ERRORS
    // ========================================

    error GameAlreadyActive();
    error GameNotActive();
    error InsufficientFee();
    error MaxRalliesReached();
    error NoBallToServe();
    error AlreadyHasBall();
    error InsufficientContractBalance();
    error InvalidMaxRallies();
    error InvalidPeer();
    error SelfCallFailed();
    error OnlySelfCall();
    error InvalidAddress();
    error WithdrawFailed();

    // ========================================
    // EVENTS
    // ========================================

    event GameStarted(uint256 ballValue, uint256 maxRallies, uint256 timestamp);
    event BallServed(uint256 ballValue, uint256 rallyCount, bytes32 messageId);
    event BallReceived(uint256 ballValue, uint256 rallyCount, uint256 timestamp);
    event BallReturned(uint256 newBallValue, uint256 rallyCount, bytes32 messageId);
    event GameEnded(uint256 finalRallyCount, uint256 timestamp, string reason);
    event ContractFunded(address indexed funder, uint256 amount);
    event FeeEstimated(uint256 nativeFee, uint256 lzTokenFee);

    // ========================================
    // VIEW FUNCTIONS
    // ========================================

    function INITIAL_BALL_VALUE() external view returns (uint256);
    function SEND_BALL() external view returns (uint16);
    function MAX_RALLIES_CAP() external view returns (uint256);
    function ballValue() external view returns (uint256);
    function rallyCount() external view returns (uint256);
    function maxRallies() external view returns (uint256);
    function hasBall() external view returns (bool);
    function gameActive() external view returns (bool);
    function peerEid() external view returns (uint32);

    // ========================================
    // EXTERNAL FUNCTIONS
    // ========================================

    /**
     * @notice Get a quote for sending the ball to the peer chain
     * @param _ballValue The ball value to send
     * @param _rallyCount Current rally count
     * @param _options Message execution options
     * @param _payInLzToken Whether to return fee in ZRO token
     * @return fee A MessagingFee struct containing the calculated gas fee
     */
    function quote(
        uint256        _ballValue,
        uint256        _rallyCount,
        bytes calldata _options,
        bool           _payInLzToken
    ) external view returns (MessagingFee memory fee);

    /**
     * @notice Starts a new game and serves the ball to the peer chain.
     * @param _maxRallies Circuit breaker for auto-rallies (1–100).
     * @param _options Execution options for gas on the destination.
     * @dev Requires sending the LayerZero native fee in `msg.value`.
     *      Emits {GameStarted} and {BallServed}.
     */
    function serve(uint256 _maxRallies, bytes calldata _options) external payable;

    /**
     * @notice Funds the contract to pay LayerZero executor/native fees during auto-rallies.
     * @dev Emits {ContractFunded}.
     */
    function fund() external payable;

    /**
     * @notice Ends the current game (owner-only in implementation).
     * @dev Emits {GameEnded} with reason "Paused by owner".
     */
    function pauseGame() external;

    /// @return Current native token balance available for LayerZero fees.
    function getContractBalance() external view returns (uint256);

    /**
     * @notice Set the trusted peer (Solana side)
     * @param _eid Remote endpoint ID
     * @param _peer Peer address as bytes32
     * @dev Call once per deployment after you know the peer address
     */
    function setPeer(uint32 _eid, bytes32 _peer) external;

    /**
     * @notice Withdraw leftover native fees
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdraw(address payable to, uint256 amount) external;
}