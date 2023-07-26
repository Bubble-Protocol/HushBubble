import React, { useState } from "react";
import "./style.css";
import { ChatFrame } from "./ChatFrame";
import { stateManager } from "../../../state-context.js";
import { ChatSelector } from "./ChatSelector";

export const ChatScreen = ({mobileView, setMobileView}) => {

  const chats = stateManager.useStateData('chats')();
  const unread = stateManager.useStateData('total-unread')();
  const myId = stateManager.useStateData('myId')();

  const [selectedChat, setSelectedChat] = useState(chats.length > 0 ? 0 : undefined);
  if (selectedChat === undefined && chats.length > 0) setSelectedChat(0);

  // Mobile swipe detection

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50 

  const onTouchStart = (e) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe || isRightSwipe) console.log('swipe', isLeftSwipe ? 'left' : 'right')
    if (isLeftSwipe) handleSwipeLeft(); 
    if (isRightSwipe) handleSwipeRight(); 
  }

  const handleSwipeRight = () => {
    if (mobileView === 'chat') setMobileView('menu');
  };

  const handleSwipeLeft = () => {
    if (mobileView === 'menu') setMobileView('chat');
  };

  chats.sort((a,b) => { return getLastMessageTime(b) - getLastMessageTime(a) });

  return (

    <div className={"chat-screen" + (mobileView === 'menu' ? ' mobile-menu-visible' : '')} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} >

      <div className="chat-column">
        <div className="title-item">
          <div className="selector-content">
            <div className="selector-title-row">
              <div className="title-item-title">Inbox</div>
            </div>
            <p className="p">{chats.length} conversation{chats.length === 1 ? '' : 's'}, {unread} unread message{unread === 1 ? '' : 's'}</p>
          </div>
        </div>
        <div className="secondary-dividing-line" />
        <div className="chat-list">
          {chats !== undefined &&
            chats.map((c, index) => {
              return <ChatSelector key={index} chat={c} myId={myId} selected={index === selectedChat} onClick={() => setSelectedChat(index)} />
            })
          }
        </div>
      </div>

      <div className="chat-frame">
        {selectedChat !== undefined && <ChatFrame chat={chats[selectedChat]} />} 
      </div>

    </div>
  );
};


function getLastMessageTime(conversation) {
  if (conversation.messages.length === 0) return Number.MAX_SAFE_INTEGER;
  else return conversation.messages.slice(-1)[0].modified;
}
