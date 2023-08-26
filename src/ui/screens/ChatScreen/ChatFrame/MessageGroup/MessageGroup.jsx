import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../../../../assets/img/unknown-contact-icon.png";
import { Message } from "../Message/Message";

export const MessageGroup = ({
  isRemote,
  from,
  messages
}) => {
  return (
    <div className={"message-group"+(!isRemote ? ' message-group-remote' : '')}>
      <img className="icon" src={from.icon || defaultIcon} />
      <div className="messages">
        {messages.map(msg => <Message key={msg.id} isRemote={isRemote} message={msg} />)}
        {isRemote && <div className="name-text">{from.getKnownAs()}</div>}
      </div>
    </div>
  );
};

MessageGroup.propTypes = {
  from: PropTypes.object.isRequired,
  isRemote: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
};
