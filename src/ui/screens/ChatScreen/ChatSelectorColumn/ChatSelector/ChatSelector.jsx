/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../../../../assets/img/unknown-contact-icon.png";
import { stateManager } from "../../../../../state-context";

export const ChatSelector = ({
  chat,
  myId,
  selected = false,
  onClick
}) => {

  const chatData = stateManager.useStateData(chat.id+'-metadata')();
  const messages = stateManager.useStateData(chat.id+'-messages')();
  const notifications = stateManager.useStateData(chat.id+'-unread')();
  const connectionState = stateManager.useStateData(chat.id+'-connection-state')();

  // Calculate fields

  const { title, members, icon } = chatData;
  const latestMessage = !messages ? {} : messages.length === 0 ? {} : messages.slice(-1)[0];
  const otherMember = !members || members.length === 0 ? {} : members[0].id === myId.id ? members[1] : members[0];


  return (
    <div className={"chat-selector" + (selected ? ' selected' : '') + (connectionState !== 'open' ? ' disabled' : '')} onClick={onClick}>
      <img className="contact-icon" src={icon || otherMember.icon || defaultIcon} />
      <div className="content">
        <div className="title-row">
          <div className="title">{formatTitle(title || otherMember.title || otherMember.address)}</div>
          {notifications === 0 && <div className="time">{formatTime(latestMessage.modified)}</div>}
          {notifications > 0 && (
            <div className="notification">
              <div className="notification-text">{notifications > 99 ? '99' : notifications}</div>
            </div>
          )}
        </div>
        <p className="text">{connectionState !== 'open' ? connectionState : (latestMessage.text || '')}</p>
      </div>
    </div>
  );

};


ChatSelector.propTypes = {
  chat: PropTypes.object.isRequired,
  myId: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};


//
// Format functions
//

function formatTitle(title) {
  if (title && title.length === 42 && title.slice(0,2) === '0x') return title.slice(2,6)+'..'+title.slice(-4);
  else return title;
}


function formatTime(time) {
  if (!time) return '';
  const messageDate = new Date(time);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const messageYear = messageDate.getFullYear();

  // If message is from this year
  if (currentYear === messageYear) {
    const currentTime = currentDate.getTime();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const diffInDays = Math.floor((currentTime - messageDate.getTime()) / oneDayInMilliseconds);
  
    // If message is from today
    if (diffInDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    // If message is from yesterday
    if (diffInDays === 1) {
      return 'Yesterday';
    }

    // If message is from last week
    if (diffInDays < 7) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return daysOfWeek[messageDate.getDay()];
    }
  
    // If message is from this year
    return messageDate.toLocaleString('default', { month: 'long', day: 'numeric' });
  }

  // If message is from a different year
  return messageDate.toLocaleDateString();
}
