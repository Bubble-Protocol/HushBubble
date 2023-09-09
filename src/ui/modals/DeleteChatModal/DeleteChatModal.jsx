import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { useAccount } from "wagmi";
import { ConnectWallet } from "../components/ConnectWallet";

export const DeleteChatModal = ({ chat, onDelete, onCancel, onCompletion }) => {

  const { isConnected: walletConnected } = useAccount();
  const [error, setError] = useState();
  const [state, setState] = useState('user-input');

  function deleteChat() {
    setState('deleting');
    onDelete(chat)
    .then(onCompletion)
    .catch(error => {
      console.warn('failed to delete chat', error);
      setError(new Error('Permission denied'));
      setState('user-input');
    });
  }

  return (
    <Modal 
    onCancel={onCancel}
    contentCentered={true}
    title="Delete Chat!"
    subtitle="Deleting a chat will pop it's bubble, deleting all data within it permanently. The chat will be deleted from all users' devices."
    loading={state === 'deleting'}
    contents=
      <React.Fragment>
        <div className="step-frame">
          <span className="small-text">THIS WILL PERMANENTLY DELETE THE CHAT ON ALL USERS' DEVICES!</span>
          <p className="small-text">IT CANNOT BE UNDONE!</p>
        </div>
        <div className="step-frame">
          {!error && <p className="small-text">Are you sure you want to continue?</p>}
          {error && <p className="small-text error-text">{error.details || error.message}</p>}
        </div>
        {!walletConnected && <ConnectWallet />}
        <div className="step-frame">
          {walletConnected && <Button title="Delete" onClick={deleteChat} />}
          <div className="text-button" onClick={onCancel}>Cancel</div>
        </div>
      </React.Fragment>
    />
  );
};

DeleteChatModal.propTypes = {
  chat: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};

