/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../assets/img/unknown-contact-icon.png";

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
        {remote && <div className="message-time">{icon !== defaultIcon ? '' : formatTitle(title)}</div>}
        <div className={`message-text`}>{text}</div>
        {<div className="message-time">{icon !== defaultIcon ? '' : formatTime(date)}</div>}
      </div>
  </div>
  );
};

Message.propTypes = {
  date: PropTypes.any,
  remote: PropTypes.bool,
  text: PropTypes.string,
};


function formatTitle(title) {
  if (title && title.length === 42 && title.slice(0,2) === '0x') return title.slice(2,6)+'..'+title.slice(-4)+' / ';
  else return title+' / ';
}

function formatTime(messageDate) {
  return messageDate.toLocaleTimeString().slice(0,-3);
}