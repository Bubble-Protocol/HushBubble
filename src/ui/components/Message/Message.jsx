/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";
import Linkify from 'react-linkify';

export const Message = ({
  date,
  remote,
  icon = defaultIcon,
  iconVisible = false,
  title,
  text = ""
}) => {
  return (
    <div className={"message"+ (!remote ? ' right' : '')}>
      {iconVisible && <div className="chat-icon-container">{remote && <img className="chat-icon" src={icon} />}</div>}
      <div className={"chat-message" + (!remote ? ' local-message' : ' remote-message')}>
        {remote && <div className="message-time no-mobile">{icon !== defaultIcon ? '' : title+' / '}</div>}
        <div className="message-text"><Linkify>{text}</Linkify></div>
        {<div className="message-time no-mobile">{formatTime(date)}</div>}
        <div className="mobile-meta mobile">
          {remote && <div className="message-time">{icon !== defaultIcon ? '' : title}</div>}
          {<div className="message-time">{formatTime(date)}</div>}
        </div>
      </div>
  </div>
  );
};

Message.propTypes = {
  date: PropTypes.any,
  remote: PropTypes.bool,
  text: PropTypes.string,
};


function formatTime(messageDate) {
  return messageDate.toLocaleTimeString().slice(0,-3);
}