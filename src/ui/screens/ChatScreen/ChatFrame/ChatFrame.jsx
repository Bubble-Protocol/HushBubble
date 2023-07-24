import { ChatDateRow } from "./ChatDateRow";
import { Message } from "../../../components/Message";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";

import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { Button } from "../../../components/Button/Button";
import { stateManager } from "../../../../state-context";

export const ChatFrame = ({ chat }) => {

  const [messageText, setMessageText] = useState('');
  const myId = stateManager.useStateData('myId')();
  const chatData = stateManager.useStateData(chat.id+'-metadata')();
  const messages = stateManager.useStateData(chat.id+'-messages')();
  const connectionState = stateManager.useStateData(chat.id+'-connection-state')();
  const online = stateManager.useStateData('online')();

  // Setup scroll-to-bottom

  const endOfMessagesRef = useRef(null);
  const chatColumnRef = useRef(null);

  const scrollToBottom = () => {
    const { current: chatColumn } = chatColumnRef;
    if (chatColumn && messages.length) {
      if (messages[messages.length - 1].from.id === myId.id) {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' });
      }
      else {
        const lastMessageElement = chatColumn.lastElementChild;
        if (lastMessageElement) {
          const isLastMessageInView = chatColumn.scrollHeight - chatColumn.scrollTop - chatColumn.clientHeight <= 1;
          if (isLastMessageInView) endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' });
        }
      }
    }
  }

  useEffect(scrollToBottom, [messages]);


  // Functions

  function postMessage() {
    chat.postMessage({text: messageText, from: myId.id}).then(() => setMessageText('')).catch(console.warn);
  }

  
  // Create messages view
  
  let lastDate = new Date(0);
  const messageElements = [];
  messages.forEach((msg, index) => {
    const date = new Date(msg.created);
    if (date.toDateString() !== lastDate.toDateString()) {
      messageElements.push(<ChatDateRow key={'date-'+index} date={date} />);
      lastDate = date;
    };
    messageElements.push(<Message key={index} date={date} text={msg.text} icon={msg.from.icon} title={msg.from.title || msg.from.address} remote={msg.from.id !== myId.id} />);
  })

  let chatIcons = chatData.icon 
    ? [<img key={0} className="chat-header-icon" src={chatData.icon} />] 
    : chatData.members.filter(member => member.icon).slice(0,3).map((member, index) => <img key={index} className="chat-header-icon" src={member.icon} />)
  if (chatIcons.length === 0) chatIcons = [<img key={0} className="chat-header-icon" src={defaultIcon} />];
  
  
  return (
    <div className="chat-frame" >

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-icons no-mobile">
          <div className="chat-header-member-icons">
            {chatIcons}
          </div>
        </div>
        <div className="chat-header-title-row">
          <div className="chat-header-title">{chatData.title || chatData.members[1].title || chatData.members[1].address}</div>
          {chatData.members.length > 0 && <div className="chat-header-subtext">{chatData.members.length + ' member' + (chatData.members.length === 1 ? '' : 's')}</div>}
        </div>
        <div className="chat-header-menu no-mobile" />
      </div>

      {/* Content */}
      <div className="chat-messages" ref={chatColumnRef}>
        {messageElements}
        <div></div>
        <div ref={endOfMessagesRef} />
      </div>

      {/* Footer */}
      <div className="chat-footer">
        <div className="chat-footer-contents">
          <input type="text" className="chat-text-box" value={connectionState === 'open' ? messageText : "Connection is unavailable"} onChange={e => setMessageText(e.target.value)} onKeyDown={e => e.key === 'Enter' && online && connectionState === 'open' && postMessage()} placeholder="Type something..." />
          <div className="chat-entry-menu">
            <div className="spacer" />
            <Button title="Send" onClick={postMessage} disabled={!online || connectionState !== 'open'} />
          </div>
        </div>
      </div>

    </div>
  );
};

ChatFrame.propTypes = {
  chat: PropTypes.object.isRequired
};
