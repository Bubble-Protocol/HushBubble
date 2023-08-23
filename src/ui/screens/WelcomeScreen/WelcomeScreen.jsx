import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";

export const WelcomeScreen = () => {

  const [error, setError] = useState();
  const [delegateRequest, setDelegateRequest] = useState();

  const wallet = stateManager.useStateData("wallet-functions")();

  function connectWallet() {
    wallet.connect()
      .catch(error => {
        if (error.code === 'requires-delegate' && error.delegateRequest) setDelegateRequest(error.delegateRequest);
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
      {!delegateRequest && <div className="connect-text" onClick={connectWallet}>Connect Wallet to Begin</div>}
      {delegateRequest && <div className="connect-text" onClick={signDelegation}>Login On This Device</div>}
      {error && <div className="error-text">{error.message}</div>}
    </div>
  );
};

