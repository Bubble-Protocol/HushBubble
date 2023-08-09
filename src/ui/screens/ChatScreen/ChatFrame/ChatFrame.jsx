import { ChatDateRow } from "./ChatDateRow";
import { Message } from "../../../components/Message";
import defaultIcon from "../../../../assets/img/unknown-contact-icon.png";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { Button } from "../../../components/Button/Button";
import { DropdownMenu } from "../../../components/DropdownMenu/DropdownMenu";
import { stateManager } from "../../../../state-context";
import { PopularPlus } from "../../../icons/PopularPlus";
import { PopularMoreVertical1 } from "../../../icons/PopularMoreVertical1";
import { DeleteChatModal } from "../../../modals/DeleteChatModal";
import { assert } from "@bubble-protocol/core";
import { ManageMemberModal } from "../../../modals/ManageMemberModal";
import { LeaveChatModal } from "../../../modals/LeaveChatModal";

export const ChatFrame = ({ className, chat, hide, onTerminate, setModal }) => {

  const [messageText, setMessageText] = useState('');
  const myId = stateManager.useStateData('myId')();
  const chatData = stateManager.useStateData(chat.id+'-metadata')();
  const messages = stateManager.useStateData(chat.id+'-messages')();
  const chatState = stateManager.useStateData(chat.id+'-state')();
  const connectionState = stateManager.useStateData(chat.id+'-connection-state')();
  const online = stateManager.useStateData('online')();
  const config = stateManager.useStateData('config')();
  const chatFunctions = stateManager.useStateData('chat-functions')();

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
    chat.postMessage({text: messageText}).then(() => setMessageText('')).catch(console.warn);
    chat.setReadTime(Date.now());
  }

  const leaveModal = <LeaveChatModal chat={chat} onLeave={chatFunctions.leave} onCancel={() => setModal()} onCompletion={() => setModal()} />;
  const deleteModal = <DeleteChatModal chat={chat} onDelete={chatFunctions.terminate} onCancel={() => setModal()} onCompletion={() => setModal()} />;
  const manageMemberModal = <ManageMemberModal chat={chat} onSave={chatFunctions.manageMembers} onCancel={() => setModal()} onCompletion={() => setModal()} />;


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
  
  function getTitle() {
    let title = chatData.title;
    if (!title) {
      if (!assert.isArray(chatData.members)) return 'Unknown';
      if (chatData.members.length > 2) return 'Group';
      const otherMember = chatData.members.find(m => m.id && m.id !== myId.id)
      if (otherMember) title = otherMember.address;
    }
    if (!assert.isHexString(title) || title.length <= 16) return title;
    const mobileMediaQuery = window.matchMedia('(max-width: 640px)');
    return mobileMediaQuery.matches ? title.slice(0,6) + '..' + title.slice(-4) : title;
  }

  const enabled = chatState === 'open' && connectionState === 'open';
  const stateText = chatState !== 'open' ? chatState : connectionState;
  
  return (
    <div className={"chat-frame " + className + (hide ? ' hide' : '')} >

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-menu-left mobile"></div>
        <div className="chat-header-icons no-mobile">
          <div className="chat-header-member-icons">
            {chatIcons}
          </div>
          {chat.chatType.actions.addMembers !== undefined &&
            <div className="dashed-icon-button">
              <PopularPlus className="icon-instance-node" color="#0F1217" onClick={() => setModal(manageMemberModal)} />
            </div>
          }
        </div>
        <div className="chat-header-title-row">
          <div className="chat-header-title">{getTitle()}</div>
          {chatData.members && chatData.members.length > 0 && <div className="chat-header-subtext">{chatData.members.length + ' member' + (chatData.members.length === 1 ? '' : 's')}</div>}
        </div>
        <div className="chat-header-menu">
          <DropdownMenu direction="bottom-left" options={[
            {name: "Copy Chat Link", onClick: () => navigator.clipboard.writeText(config.appUrl+'?chat='+chat.getInvite())},
            chat.chatType.actions.canLeave || chatState !== 'open' ? {name: "Leave Chat", onClick: () => setModal(leaveModal)} : null,
            {name: "Delete Chat", onClick: () => setModal(deleteModal)}
          ].filter(Boolean)} >
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
          <input 
            type="text" 
            className="chat-text-box" 
            value={enabled ? messageText : ''} 
            onChange={e => setMessageText(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && online && enabled && postMessage()} 
            placeholder={enabled ? "Type something..." : stateText} 
          />
          <div className="chat-entry-menu">
            <div className="spacer" />
            <Button title="Send" onClick={postMessage} disabled={!online || !enabled} />
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
