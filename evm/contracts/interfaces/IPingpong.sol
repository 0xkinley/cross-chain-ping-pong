pragma solidity ^0.8.22;

import { MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

interface IPingPong {

    struct GameState {
        uint128 maxRallies;
        bool    hasBall;
        bool    gameActive;
    }


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


    event GameStarted(uint256 ballValue, uint256 maxRallies, uint256 timestamp);
    event BallServed(uint256 ballValue, uint256 rallyCount, bytes32 messageId);
    event BallReceived(uint256 ballValue, uint256 rallyCount, uint256 timestamp);
    event BallReturned(uint256 newBallValue, uint256 rallyCount, bytes32 messageId);
    event GameEnded(uint256 finalRallyCount, uint256 timestamp, string reason);
    event ContractFunded(address indexed funder, uint256 amount);
    event FeeEstimated(uint256 nativeFee, uint256 lzTokenFee);


    function INITIAL_BALL_VALUE() external view returns (uint256);
    function SEND_BALL() external view returns (uint16);
    function MAX_RALLIES_CAP() external view returns (uint256);
    function ballValue() external view returns (uint256);
    function rallyCount() external view returns (uint256);
    function maxRallies() external view returns (uint256);
    function hasBall() external view returns (bool);
    function gameActive() external view returns (bool);
    function peerEid() external view returns (uint32);


    function quote(
        uint256        _ballValue,
        uint256        _rallyCount,
        bytes calldata _options,
        bool           _payInLzToken
    ) external view returns (MessagingFee memory fee);

    function serve(uint256 _maxRallies, bytes calldata _options) external payable;

    function fund() external payable;

    function pauseGame() external;

   
    function getContractBalance() external view returns (uint256);

    function setPeer(uint32 _eid, bytes32 _peer) external;

    function withdraw(address payable to, uint256 amount) external;
}