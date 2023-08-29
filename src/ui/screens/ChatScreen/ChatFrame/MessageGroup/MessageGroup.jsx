import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../../../../assets/img/unknown-contact-icon.png";
import { Message } from "../Message/Message";

export const MessageGroup = ({
  isRemote,
  from,
  messages,
  iconHidden = false,
  onResend,
}) => {
  return (
    <div className={"message-group"+(!isRemote ? ' message-group-remote' : '')}>
      {!iconHidden && <img className="icon" src={from.icon || defaultIcon} />}
      <div className="messages">
        {messages.map(msg => <Message key={msg.id} isRemote={isRemote} message={msg} onResend={onResend} />)}
        {isRemote && !iconHidden && <div className="name-text">{from.getKnownAs()}</div>}
      </div>
    </div>
  );
};

MessageGroup.propTypes = {
  from: PropTypes.object.isRequired,
  isRemote: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  iconHidden: PropTypes.bool,
  onResend: PropTypes.func
};
