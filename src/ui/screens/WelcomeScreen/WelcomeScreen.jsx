import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";

export const WelcomeScreen = () => {

  const wallet = stateManager.useStateData("wallet-functions")();
  const appState = stateManager.useStateData("app-state")();

  const [error, setError] = useState();
  const [chainError, setChainError] = useState();
  const [delegateRequest, setDelegateRequest] = useState();

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

  const walletAvailable = appState === 'no-wallet';

  return (
    <div className="welcome-screen" >
      {walletAvailable && !delegateRequest && <div className="connect-text" onClick={connectWallet}>Connect Wallet to Begin</div>}
      {walletAvailable && delegateRequest && <div className="connect-text" onClick={signDelegation}>Login On This Device</div>}
      {!walletAvailable && <div className="error-text">No Web3 wallet detected.<br/><br/>Please install a Web3 wallet such as Metamask to use this app</div>}
      {error && <div className="error-text">{error.message}</div>}
      {chainError && <div className="add-chain-text">The {chainError.name} chain is not available in your wallet.<br/>Visit <a href={"https://chainlist.org/?search="+chainError.id} target="_blank">chainlist.org</a> to add the chain to your wallet then try again.</div>}
    </div>
  );
};

