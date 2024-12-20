import { useContext, useEffect } from "react";
import Web3Context from "../context/Web3Context.js";
import { ConnectWallet } from "./connectWallet.js";
import "./wallet.css";

const Wallet = () => {
  const { Account, contractProvider, updateWeb3State } = useContext(Web3Context);

  const handleAccount = async () => {
    try {
      const [account, provider, contractSigner, contractProvider, chainId] = await ConnectWallet();
      updateWeb3State({ Account: account, provider, contractSigner, contractProvider, chainId });
    } catch (err) {
      console.error("Could not fetch details", err);
    }
  };

  useEffect(() => {
    handleAccount();
  }, []);

  return (
    <div>
      <button onClick={handleAccount}>Connect Wallet</button>
      <p>{`Account: ${Account || "Not connected"}`}</p>
    </div>
  );
};

export default Wallet;
