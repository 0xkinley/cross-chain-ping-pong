import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const PingPongEVMModule = buildModule("PingPongEVMModule", (m) => {
  // LayerZero Endpoint addresses for different networks
  // Sepolia testnet endpoint: 0x6EDCE65403992e310A62460808c4b910D972f10f
  // Ethereum mainnet endpoint: 0x1a44076050125825900e736c501f859c50fE728c
  const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  
  // Solana Devnet endpoint ID is 40168
  const peerEid = m.getParameter("peerEid", 40168);
  
  // Contract owner
  const owner = m.getParameter("owner");

  const pingPongEVM = m.contract("PingPongEVM", [endpoint, peerEid, owner]);

  return { pingPongEVM };
});

export default PingPongEVMModule;