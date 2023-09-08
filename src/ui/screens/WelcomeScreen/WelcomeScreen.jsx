import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const WelcomeScreen = () => {

  const wallet = stateManager.useStateData("wallet-functions")();
  const appState = stateManager.useStateData("app-state")();

  const [error, setError] = useState();
  const [chainError, setChainError] = useState();

  function logIn() {
    wallet.logIn()
      .catch(error => {
        if (error.code === 'chain-missing' && error.chain) setChainError(error.chain);
        else {
          console.warn(error, error.cause);
          setError(error);
        }
      });
  }

  return (
    <div className="welcome-screen" >
      <ConnectButton showBalance={false} chainStatus="none" />
      {appState === 'not-logged-in' && <div className="connect-text" onClick={logIn}>Login</div>}
      {error && <div className="error-text">{error.message}</div>}
      {chainError && <div className="add-chain-text">The {chainError.name} chain is not available in your wallet.<br/>Visit <a href={"https://chainlist.org/?search="+chainError.id} target="_blank">chainlist.org</a> to add the chain to your wallet then try again.</div>}
    </div>
  );
};

