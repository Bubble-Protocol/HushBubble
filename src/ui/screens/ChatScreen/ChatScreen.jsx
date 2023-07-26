import React, { useState } from "react";
import "./style.css";
import { ChatFrame } from "./ChatFrame";
import { stateManager } from "../../../state-context.js";
import { ChatSelectorColumn } from "./ChatSelectorColumn";

export const ChatScreen = ({mobileView, setMobileView}) => {

  const chats = stateManager.useStateData('chats')();

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


  // Sort chats
  
  chats.sort((a,b) => { return getLastMessageTime(b) - getLastMessageTime(a) });

  return (

    <div className={"chat-screen" + (mobileView === 'menu' ? ' mobile-menu-visible' : '')} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} >

      <ChatSelectorColumn chats={chats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />

      {selectedChat !== undefined && <ChatFrame chat={chats[selectedChat]} />}
      {selectedChat === undefined && <div className="chat-frame"></div>}

    </div>
  );
};


function getLastMessageTime(conversation) {
  if (conversation.messages.length === 0) return Number.MAX_SAFE_INTEGER;
  else return conversation.messages.slice(-1)[0].modified;
}
