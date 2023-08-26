import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";

export const WelcomeScreen = ({ walletAvailable }) => {

  const [error, setError] = useState(walletAvailable ? undefined : new Error('Please install a Web3 wallet such as Metamask to use this app'));
  const [chainError, setChainError] = useState();
  const [delegateRequest, setDelegateRequest] = useState();

  const wallet = stateManager.useStateData("wallet-functions")();

  function connectWallet() {
    wallet.connect()
      .catch(error => {
        if (error.code === 'requires-delegate' && error.delegateRequest) setDelegateRequest(error.delegateRequest);
        else if (error.code === 'chain-missing' && error.chain) setChainError(error.chain);
        else {
          console.warn(error, error.cause);
          setError(error);
        }
      });
  }

  function signDelegation() {
    wallet.connect(delegateRequest.delegation).catch(setError);
  }

  return (
    <div className="welcome-screen" >
      {walletAvailable && !delegateRequest && <div className="connect-text" onClick={connectWallet}>Connect Wallet to Begin</div>}
      {walletAvailable && delegateRequest && <div className="connect-text" onClick={signDelegation}>Login On This Device</div>}
      {error && <div className="error-text">{error.message}</div>}
      {chainError && <div className="add-chain-text">The {chainError.name} chain is not available in your wallet.<br/>Visit <a href={"https://chainlist.org/?search="+chainError.id}>chainlist.org</a> to add the chain to your wallet then try again.</div>}
    </div>
  );
};

