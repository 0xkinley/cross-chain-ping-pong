import { ethers } from "ethers";
import * as dotenv from "dotenv";
import bs58 from "bs58";

dotenv.config();

// Contract ABIs
const PING_PONG_ABI = [
    "function setPeer(uint32 _eid, bytes32 _peer) external",
    "function setDelegate(address _delegate) external",
    "function endpoint() external view returns (address)",
    "function delegates(address) external view returns (address)",
    "function owner() external view returns (address)",
    "function peers(uint32 eid) external view returns (bytes32)"
];

const ENDPOINT_ABI = [
    "function setConfig(address _oapp, address _lib, uint32[] calldata _eids, uint8[] calldata _types, bytes[] calldata _config) external",
    "function getConfig(address _oapp, address _lib, uint32 _eid, uint8 _type) external view returns (bytes memory)",
    "function isOApp(address _oapp) external view returns (bool)",
    "function delegates(address _oapp) external view returns (address)"
];

async function main() {
    // Configuration
    const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const PINGPONG_ADDRESS = "0x7271592d027fc1055F7E13f8947a1D5CBc8Aed10";
    const SOLANA_PROGRAM = "Cw5hAtJEQp3vEnR4Vejbb8P7VSa5TWFzTrzpMNNEe8TF";
    const SOLANA_EID = 40168; // Solana V2 Testnet
    
    if (!PRIVATE_KEY) {
        throw new Error("Please set PRIVATE_KEY in your .env file");
    }
    
    console.log("🚀 Registering EVM OApp with LayerZero...\n");
    
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const pingPong = new ethers.Contract(PINGPONG_ADDRESS, PING_PONG_ABI, wallet);
    
    console.log("Network:", (await provider.getNetwork()).name);
    console.log("Wallet:", wallet.address);
    console.log("PingPong:", PINGPONG_ADDRESS);
    
    // Get endpoint address
    const endpointAddress = await pingPong.endpoint();
    const endpoint = new ethers.Contract(endpointAddress, ENDPOINT_ABI, wallet);
    console.log("Endpoint:", endpointAddress);
    
    // Step 1: Set delegate (this registers the OApp)
    console.log("\n📝 Step 1: Setting delegate (registering OApp)...");
    const currentDelegate = await endpoint.delegates(PINGPONG_ADDRESS);
    
    if (currentDelegate === ethers.ZeroAddress) {
        const tx1 = await pingPong.setDelegate(wallet.address);
        console.log("Setting delegate tx:", tx1.hash);
        await tx1.wait();
        console.log("✅ Delegate set!");
    } else {
        console.log("✅ Delegate already set:", currentDelegate);
    }
    
    // Skip isOApp check - not available on testnet endpoint
    
    // Step 2: Set peer
    console.log("\n🔗 Step 2: Setting Solana peer...");
    
    // Decode Solana address from base58 to bytes32
    const solanaAddressBytes = bs58.decode(SOLANA_PROGRAM);
    const solanaProgramBytes = ethers.zeroPadValue(
        ethers.hexlify(solanaAddressBytes),
        32
    );
    
    const currentPeer = await pingPong.peers(SOLANA_EID);
    if (currentPeer === ethers.ZeroAddress) {
        const tx2 = await pingPong.setPeer(SOLANA_EID, solanaProgramBytes);
        console.log("Setting peer tx:", tx2.hash);
        await tx2.wait();
        console.log("✅ Peer set!");
    } else {
        console.log("✅ Peer already set:", currentPeer);
    }
    
    // Step 3: Verify setup
    console.log("\n🔍 Step 3: Verifying setup...");
    console.log("Owner:", await pingPong.owner());
    console.log("Delegate:", await endpoint.delegates(PINGPONG_ADDRESS));
    console.log("Solana peer:", await pingPong.peers(SOLANA_EID));
    
    console.log("\n✅ EVM OApp registration complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Make sure Solana side is also configured");
    console.log("2. Fund the contract with ETH for gas");
    console.log("3. Call serve() to start the game!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });