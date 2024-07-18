import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import heroImage from "../../../assets/img/hero.png";

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
      <img src={heroImage} class="hero-image"></img>
      <div className="titles">
        <h1>Welcome to HushBubble!</h1>
        <subtitle>End-to-end encrypted decentralised messaging app.</subtitle>
      </div>
      <div className="description">
        <p>
          HushBubble is built on <a href="https://bubbleprotocol.com" target="_blank">Bubble Protocol's</a> secure off-chain storage technology.
          Your chats are end-to-end encrypted and stored in a private <a href="https://bubbleprotocol.com/how-it-works.html" target="_blank">bubble</a> on an off-chain host of your choice. 
        </p>
      </div>
      <p>
        Connect your wallet to begin.
      </p>
      <ConnectButton showBalance={false} chainStatus="none" />
      {appState === 'not-logged-in' && <div className="connect-text" onClick={logIn}>Login</div>}
      {error && <div className="error-text">{error.details || error.message}</div>}
      {chainError && <div className="add-chain-text">The {chainError.name} chain is not available in your wallet.<br/>Visit <a href={"https://chainlist.org/?search="+chainError.id} target="_blank">chainlist.org</a> to add the chain to your wallet then try again.</div>}
    </div>
  );
};

