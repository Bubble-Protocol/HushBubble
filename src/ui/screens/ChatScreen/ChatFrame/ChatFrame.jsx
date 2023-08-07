import { ChatDateRow } from "./ChatDateRow";
import { Message } from "../../../components/Message";
import defaultIcon from "../../../../assets/img/unknown-contact-icon.png";

import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { Button } from "../../../components/Button/Button";
import { DropdownMenu } from "../../../components/DropdownMenu/DropdownMenu";
import { stateManager } from "../../../../state-context";
import { PopularMoreVertical1 } from "../../../icons/PopularMoreVertical1";
import { DeleteChatModal } from "../../../modals/DeleteChatModal";

export const ChatFrame = ({ className, chat, hide, onTerminate, setModal }) => {

  const [messageText, setMessageText] = useState('');
  const myId = stateManager.useStateData('myId')();
  const chatData = stateManager.useStateData(chat.id+'-metadata')();
  const messages = stateManager.useStateData(chat.id+'-messages')();
  const connectionState = stateManager.useStateData(chat.id+'-connection-state')();
  const online = stateManager.useStateData('online')();
  const config = stateManager.useStateData('config')();

  // Setup scroll-to-bottom

  const endOfMessagesRef = useRef(null);
  const chatColumnRef = useRef(null);

  const atBottom = () => {
    const { current: chatColumn } = chatColumnRef;
    return chatColumn.scrollHeight - chatColumn.scrollTop - chatColumn.clientHeight < 1;
  }

  const scrollToBottom = (force = false) => {
    const { current: chatColumn } = chatColumnRef;
    if (chatColumn && messages.length) {
      if (force || messages[messages.length - 1].from.id === myId.id) {
        chatColumn.scrollTo(0, chatColumn.scrollHeight);
      }
      else if (!atBottom()) chatColumn.scrollTo(0, chatColumn.scrollHeight);
    }
  }

  useEffect(scrollToBottom, [messages]);
  useEffect(() => scrollToBottom(true), []);


  // Clear notifications if user scrolls to bottom

  useEffect(() => {

    const handleScroll = () => {
      if (atBottom() && document.hasFocus()) chat.setReadTime(Date.now());
    };
  
    const chatContainer = chatColumnRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);


  // Functions & Modals

  function postMessage() {
    chat.postMessage({text: messageText, from: myId.id}).then(() => setMessageText('')).catch(console.warn);
    chat.setReadTime(Date.now());
  }

  const deleteModal = <DeleteChatModal chat={chat} onDelete={onTerminate} onCancel={() => setModal()} onCompletion={() => setModal()} />;


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
    : chatData.members 
      ? chatData.members.filter(member => member.icon).slice(0,3).map((member, index) => <img key={index} className="chat-header-icon" src={member.icon} />)
      : []
  if (chatIcons.length === 0) chatIcons = [<img key={0} className="chat-header-icon" src={defaultIcon} />];
  
  
  return (
    <div className={"chat-frame " + className + (hide ? ' hide' : '')} >

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-menu-left mobile"></div>
        <div className="chat-header-icons no-mobile">
          <div className="chat-header-member-icons">
            {chatIcons}
          </div>
        </div>
        <div className="chat-header-title-row">
          <div className="chat-header-title">{chatData.title}</div>
          {chatData.members && chatData.members.length > 0 && <div className="chat-header-subtext">{chatData.members.length + ' member' + (chatData.members.length === 1 ? '' : 's')}</div>}
        </div>
        <div className="chat-header-menu">
          <DropdownMenu direction="bottom-left" options={[
            {name: "Copy Chat Link", onClick: () => navigator.clipboard.writeText(config.appUrl+'?chat='+chat.getInvite())},
            {name: "Delete Chat", onClick: () => setModal(deleteModal)}
          ]} >
            <PopularMoreVertical1 className="icon-instance-node-3" />
          </DropdownMenu>
        </div>
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
  className: PropTypes.string,
  chat: PropTypes.object.isRequired,
  onTerminate: PropTypes.func.isRequired,
  hide: PropTypes.bool
};
