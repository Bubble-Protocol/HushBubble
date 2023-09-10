import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { ErrorCodes } from "@bubble-protocol/core";
import { ModalHostInfo } from "../../components/ModalHostInfo";
import { ConnectWallet } from "../components/ConnectWallet";
import { useAccount } from 'wagmi'

export const JoinChatModal = ({ invite, onJoin, onCancel, onCompletion }) => {

  const { isConnected: walletConnected } = useAccount();
  const [error, setError] = useState();
  const [chainError, setChainError] = useState();

  function join() {
    onJoin(invite).then(onCompletion)
      .catch(error => {
        if (error.code === ErrorCodes.BUBBLE_ERROR_BUBBLE_TERMINATED) setError(new Error('Chat no longer exists'));
        else if (error.code === ErrorCodes.BUBBLE_ERROR_PERMISSION_DENIED) setError(new Error('Permission denied'));
        else if (error.code === 'chain-missing' && error.chain) setChainError(error.chain);
        else setError(error);
      })
  }

  const fromName = invite.from.title || (invite.from.account ? invite.from.account.slice(0,6)+'..'+invite.from.account.slice(-4) : 'Unknown');

  return (
    <Modal 
    onCancel={onCancel}
    contentCentered={true}
    title="Join Chat"
    contents=
      {
        invite.valid ?
          <React.Fragment>
            <p className="centered-row step-title">{invite.from.icon && <img className="logo" src={invite.from.icon}/>} {fromName}</p>
            <p>...is inviting you to join a {invite.bubbleType.title}</p>
            {invite.bubbleType && <p className="small-text">{invite.bubbleType.details}</p>}
            {<ModalHostInfo chain={invite.chain} host={invite.host} centered={true} />}
            <div></div>
            {!walletConnected && <ConnectWallet />}
            {error && <p className="small-text error-text">{error.details || error.message}</p>}
            {chainError && <div className="small-text error-text">The {chainError.name} chain is not available in your wallet.<br/>Visit <a href={"https://chainlist.org/?search="+chainError.id} target="_blank">chainlist.org</a> to add the chain to your wallet then try again.</div>}
            {walletConnected && <Button title="Join" onClick={() => join()} disabled={invite === undefined} />}
          </React.Fragment>
        :
          <React.Fragment>
            <div className="step-frame">
              <p className="small-text error-text">The invite is invalid ({invite.error.message})</p>
            </div>
            <Button title="Cancel" onClick={onCancel} />
          </React.Fragment>
      }
    />
  );
};

JoinChatModal.propTypes = {
  invite: PropTypes.object.isRequired,
  onJoin: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func,
};

