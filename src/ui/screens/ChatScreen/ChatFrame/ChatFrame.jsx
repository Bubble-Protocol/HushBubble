import { ChatDateRow } from "./ChatDateRow";
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
import { EditChatModal } from "../../../modals/EditChatModal/EditChatModal";
import { ArrowLeft } from "../../../icons/ArrowLeft/ArrowLeft";
import { MessageGroup } from "./MessageGroup";

export const ChatFrame = ({ className, mobileVisible, chat, onBack, hide, setModal }) => {

  const [messageText, setMessageText] = useState('');
  const myId = stateManager.useStateData('myId')();
  const chatData = stateManager.useStateData(chat.id+'-metadata')();
  const messages = stateManager.useStateData(chat.id+'-messages')();
  const chatState = stateManager.useStateData(chat.id+'-state')();
  const connectionState = stateManager.useStateData(chat.id+'-connection-state')();
  const capabilities = stateManager.useStateData(chat.id+'-capabilities')();
  const online = stateManager.useStateData('online')();
  const config = stateManager.useStateData('config')();
  const chatFunctions = stateManager.useStateData('chat-functions')();
  const notifications = stateManager.useStateData(chat.id+'-unread')();

  //
  // Setup scroll-to-bottom
  //

  // ref notifications for scroll event handler

  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);


  // ref chatColumn for scroll to bottom functions

  const chatColumnRef = useRef(null);

  const isScrolledToBottom = () => {
    const el = chatColumnRef.current;
    return el ? el.scrollHeight - el.scrollTop - el.clientHeight < 96: false;
  };

  const scrollToBottom = () => {
    const el = chatColumnRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Auto-scroll to the bottom if user is already at the bottom
  useEffect(() => {
    if (!hide && mobileVisible) {
      if (isScrolledToBottom()) {
        chat.setReadTime(Date.now())
        scrollToBottom();
      }
    }
  }, [hide, messages]);

  // Handle manual user scrolling
  const handleScroll = () => {
    if (notificationsRef.current > 0 && isScrolledToBottom()) {
      chat.setReadTime(Date.now());
    }
  };

  // useEffect for scroll event listener
  useEffect(() => {
    const el = chatColumnRef.current;
    if (el) {
      setTimeout(scrollToBottom, 1000);
      el.addEventListener('scroll', () => handleScroll(notifications));
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);


  // Functions & Modals

  function postMessage() {
    const text = messageText.trim();
    if (!text) return;
    chat.postMessage({text: text}).then(() => setMessageText('')).catch(console.warn);
    chat.setReadTime(Date.now());
    scrollToBottom();
  }

  const editModal = <EditChatModal chat={chat} onCancel={() => setModal()} onCompletion={() => setModal()} />;
  const leaveModal = <LeaveChatModal chat={chat} onLeave={chatFunctions.leave} onCancel={() => setModal()} onCompletion={() => setModal()} />;
  const deleteModal = <DeleteChatModal chat={chat} onDelete={chatFunctions.terminate} onCancel={() => setModal()} onCompletion={() => setModal()} />;
  const manageMemberModal = <ManageMemberModal chat={chat} onSave={chatFunctions.manageMembers} onCancel={() => setModal()} onCompletion={() => setModal()} />;


  // Group messages
  
  const groupedMessages = [];
  let currentGroup = null;
  let lastDateStr = new Date(0).toDateString();

  messages.forEach((msg) => {
    const msgDateStr = new Date(msg.created).toDateString();
    if (!currentGroup || currentGroup.from.account !== msg.from.account || lastDateStr !== msgDateStr) {
      if (currentGroup) groupedMessages.push(currentGroup);
      currentGroup = { from: msg.from, messages: [] };
    }
    currentGroup.messages.push(msg);
    lastDateStr = msgDateStr;
  });

  if (currentGroup) groupedMessages.push(currentGroup);

  
  lastDateStr = new Date(0).toDateString();

  const messageElements = groupedMessages.flatMap(group => {
    const firstMessageDate = new Date(group.messages[0].created);
    const dateStr = firstMessageDate.toDateString();
    let elements = [];
  
    if (dateStr !== lastDateStr) {
      elements.push(<ChatDateRow key={'date-' + group.messages[0].id} date={firstMessageDate} />);
      lastDateStr = dateStr;
    }

    elements.push(
      <MessageGroup
        key={group.messages[0].id} 
        from={group.from} 
        isRemote={group.from.account !== myId.account}
        messages={group.messages}
        onResend={chat.resendFailedMessages.bind(chat)}
      />
    );

    return elements;
  });
  
  // Chat icons
  
  let chatIcons = chatData.icon 
    ? [<img key={0} className="chat-header-icon" src={chatData.icon} />] 
    : chatData.members 
      ? chatData.members
        .filter(member => member.icon)
        .filter(member => member.id !== myId.id)
        .slice(0,3)
        .map((member, index) => <img key={index} className="chat-header-icon" src={member.icon} />)
      : []
  if (chatIcons.length === 0) chatIcons = [<img key={0} className="chat-header-icon" src={defaultIcon} />];
  
  function getTitle() {
    let title = chatData.title || 'Unknown';
    if (!assert.isHexString(title) || title.length <= 16) return title;
    const mobileMediaQuery = window.matchMedia('(max-width: 640px)');
    return mobileMediaQuery.matches ? title.slice(0,6) + '..' + title.slice(-4) : title;
  }

  const enabled = chatState === 'open' && connectionState === 'open';
  const stateText = chatState !== 'open' ? chatState : connectionState;
  const chatInfo = chat.getChatInfo();

  return (
    <div className={"chat-frame " + className + (hide ? ' hide' : '')} >

      {/* Header */}
      <div className="chat-header">
        <ArrowLeft className="chat-header-menu-left button-like mobile" color="#0F1217" onClick={onBack} />
        <div className="chat-header-icons no-mobile">
          <div className="chat-header-member-icons">
            {chatIcons}
          </div>
          {capabilities.canManageMembers &&
            <div className="dashed-icon-button">
              <PopularPlus className="icon-instance-node" color="#0F1217" onClick={() => setModal(manageMemberModal)} />
            </div>
          }
        </div>
        <div className="chat-header-title-row">
          <div className="chat-header-title">{getTitle()}</div>
          {chatInfo && <div className="chat-header-subtext">{chatInfo}</div>}
        </div>
        <div className="chat-header-menu">
          <DropdownMenu direction="bottom-left" options={[
            {name: "Copy Chat Link", onClick: () => navigator.clipboard.writeText(config.appUrl+'?chat='+chat.getInvite())},
            chat.chatType.metadata.title || chat.chatType.metadata.icon ? {name: 'Edit Chat', onClick: () => setModal(editModal)} : null,
            capabilities.canLeave || chatState !== 'open' ? {name: "Leave Chat", onClick: () => setModal(leaveModal)} : null,
            capabilities.canDelete ? {name: "Delete Chat", onClick: () => setModal(deleteModal)} : null
          ].filter(Boolean)} >
            <PopularMoreVertical1 className="icon-instance-node-3" />
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="chat-messages" ref={chatColumnRef}>
        {messageElements}
        <div></div>
      </div>

      {/* Footer */}
      <div className="chat-footer">
        <div className="chat-footer-contents">
          <input 
            type="text" 
            className="chat-text-box" 
            value={enabled && capabilities.canWrite ? messageText : ''} 
            onChange={e => setMessageText(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && postMessage()}
            disabled={!online || !enabled || !capabilities.canWrite}
            placeholder={!enabled ? stateText : capabilities.canWrite ? "Type something..." : "You do not have permission to write to this chat."} 
          />
          <div className="chat-entry-menu">
            <div className="spacer" />
            <Button title="Send" onClick={postMessage} disabled={!online || !enabled || !capabilities.canWrite} />
          </div>
        </div>
      </div>

    </div>
  );
};

ChatFrame.propTypes = {
  className: PropTypes.string,
  mobileVisible: PropTypes.bool,
  chat: PropTypes.object.isRequired,
  hide: PropTypes.bool
};
