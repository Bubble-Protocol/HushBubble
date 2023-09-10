import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

export const ConnectWallet = () => {

  return (
    <div className="step-frame">
      <p className="step-title">Connect Wallet</p>
      <p className="small-text">Connect your wallet to continue</p>
      <ConnectButton showBalance={false} chainStatus="none" />
    </div>
  );
  
};
