import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { TextBox } from "../../components/TextBox";
import { ContentId } from "@bubble-protocol/core";

export const JoinChatModal = ({ onJoin, onCancel, onCompletion }) => {
  const [bubbleId, setBubbleId] = useState('');
  const [error, setError] = useState();

  let contentId;
  try {
    let id = bubbleId;
    try {
      const url = new URL(bubbleId);
      id = url.searchParams.get('chat');
    }
    catch(_) {}
    contentId = new ContentId(id);
  }
  catch(_) {}

  return (
    <Modal 
    onCancel={onCancel}
    centered={true}
    contentCentered={true}
    title="Join Chat"
    subtitle="Join a chat created by someone else." 
    contents=
      <React.Fragment>
        <div className="step-frame">
          <p className="small-text">Paste the chat ID below to join</p>
          <TextBox className="stretch" text={contentId ? contentId.toString() : bubbleId} onChange={setBubbleId} valid={contentId !== undefined} />
        </div>
          {error && <p className="small-text error-text">{error.message}</p>}
          <Button title="Join" onClick={() => onJoin(contentId).then(onCompletion).catch(error => { console.debug(error); setError(error) })} disabled={contentId === undefined} />
      </React.Fragment>
    />
  );
};

JoinChatModal.propTypes = {
  onJoin: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func,
};

