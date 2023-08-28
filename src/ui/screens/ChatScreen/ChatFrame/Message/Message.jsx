/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import Linkify from 'react-linkify';
import failedIcon from '../../../../../assets/img/exclamation.png';

export const Message = ({
  isRemote,
  message,
  onResend
}) => {
  return (
    <div className={"message"+ (!isRemote ? ' message-remote' : '')}>
      {message.state === 'failed' && <img className="failed-icon" src={failedIcon} onClick={onResend}></img>}
      <div className={"chat-message" + (!isRemote ? ' local-message' : ' remote-message')}>
        <div className="message-text"><Linkify>{message.text}</Linkify></div>
        <div className="message-time">{formatTime(message.created)}</div>
      </div>
  </div>
  );
};

Message.propTypes = {
  isRemote: PropTypes.bool.isRequired,
  message: PropTypes.object.isRequired,
  onResend: PropTypes.func.isRequired
};


function formatTime(time) {
  return new Date(time).toLocaleTimeString().slice(0,-3);
}