import { useState } from "react";
import Web3Context from "./context/Web3Context";
import Sidebar from "./components/sidebar/Sidebar";
import Wallet from "./wallet/Wallet.js";

function App() {
  const [web3State, setWeb3State] = useState({
    Account: null,
    provider: null,
    contractSigner: null,
    contractProvider: null,
    chainId: null,
  });

  const updateWeb3State = (newState) => {
    setWeb3State((prevState) => ({ ...prevState, ...newState }));
  };

  return (
    <Web3Context.Provider value={{ ...web3State, updateWeb3State }}>
      {/* <Wallet /> */}
      <Sidebar />
    </Web3Context.Provider>
  );
}

export default App;
