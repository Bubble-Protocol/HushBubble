import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";

export const LeaveChatModal = ({ chat, onLeave, onCancel, onCompletion }) => {
  const [error, setError] = useState();
  const [state, setState] = useState('user-input');

  function leaveChat() {
    setState('leaving');
    onLeave(chat)
    .then(onCompletion)
    .catch(error => {
      console.warn('could not leave chat', error);
      setError(new Error(error.message));
      setState('user-input');
    });
  }

  return (
    <Modal 
    onCancel={onCancel}
    contentCentered={true}
    title="Leave Chat"
    subtitle="Leaving this chat will delete all its data from this device. The chat bubble itself will remain open.  All other members will be unaffected and will not know you have left."
    loading={state === 'leaving'}
    contents=
      <React.Fragment>
        <div className="step-frame">
        </div>
        <div className="step-frame">
          {!error && <p className="small-text">Are you sure you want to leave this chat?</p>}
          {!error && <p className="small-text">You can rejoin the chat any time if you have the chat link.</p>}
          {error && <p className="small-text error-text">{error.details || error.message}</p>}
        </div>
        <div className="step-frame">
          <Button title="Leave" onClick={leaveChat} />
        </div>
        <div className="text-button" onClick={onCancel}>Cancel</div>
        </React.Fragment>
    />
  );
};

LeaveChatModal.propTypes = {
  chat: PropTypes.object.isRequired,
  onLeave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};

