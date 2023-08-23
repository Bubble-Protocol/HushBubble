import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { TextBox } from "../../components/TextBox";
import { ErrorCodes } from "@bubble-protocol/core";
import { stateManager } from "../../../state-context";

export const JoinChatModal = ({ bubbleIn, onJoin, onCancel, onCompletion }) => {
  const [bubbleId, setBubbleId] = useState(bubbleIn);
  const [delegateRequest, setDelegateRequest] = useState();
  const [error, setError] = useState();
  const walletFunctions = stateManager.useStateData('wallet-functions')();
  const wallet = stateManager.useStateData('wallet')();

  let invite = bubbleId;
  try {
    const url = new URL(bubbleId);
    invite = url.searchParams.get('chat');
  }
  catch(_) {}

  function join(delegation) {
    onJoin(invite, delegation).then(onCompletion)
      .catch(error => {
        console.debug(error);
        if (error.code === ErrorCodes.BUBBLE_ERROR_BUBBLE_TERMINATED) setError(new Error('Chat no longer exists'));
        else if (error.code === 'requires-delegate' && error.delegateRequest) setDelegateRequest(error.delegateRequest);
        else if (error.code === ErrorCodes.BUBBLE_ERROR_PERMISSION_DENIED) setError(new Error('Permission denied'));
        else setError(error);
      })
  }

  function connectWallet() {
    walletFunctions.connect();
  }

  function signDelegation() {
    console.debug('signDelegation', delegateRequest.delegation)
    delegateRequest.delegation.sign(wallet.getSignFunction())
      .then(() => join(delegateRequest.delegation));
  }

  return (
    <Modal 
    onCancel={onCancel}
    contentCentered={true}
    title="Join Chat"
    subtitle="Join a chat created by someone else." 
    contents=
      <React.Fragment>
        {!delegateRequest && 
          <>
            <div className="step-frame">
              <p className="small-text">Paste the chat ID below to join</p>
              <TextBox text={invite} onChange={setBubbleId} valid={invite !== undefined} />
            </div>
            {error && <p className="small-text error-text">{error.message}</p>}
            <Button title="Join" onClick={() => join()} disabled={invite === undefined} />
          </>
        }
        {delegateRequest &&
          <div className="step-frame">
            <p className="small-text">HushBubble needs your permission to access this chat.</p>
            {!wallet && 
              <div className="text-button" onClick={connectWallet}>Connect your wallet</div>
            }
            {wallet &&
              <>
                <p className="small-text">Your wallet must sign an access token to allow this app to access the bubble.</p>
                {error && <p className="small-text error-text">{error.message}</p>}
                <div className="text-button" onClick={signDelegation}>Sign Access Token</div>
              </>
            }
          </div>
        }
      </React.Fragment>
    />
  );
};

JoinChatModal.propTypes = {
  bubbleIn: PropTypes.string,
  onJoin: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func,
};

