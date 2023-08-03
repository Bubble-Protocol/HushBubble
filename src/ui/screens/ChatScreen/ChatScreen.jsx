import React, { useState } from "react";
import "./style.css";
import { ChatFrame } from "./ChatFrame";
import { stateManager } from "../../../state-context.js";
import { ChatSelectorColumn } from "./ChatSelectorColumn";

export const ChatScreen = ({mobileView, setMobileView, setModal}) => {

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

  const orderedChats = [...chats];
  orderedChats.sort((a,b) => { return getLastMessageTime(b.getMessages()) - getLastMessageTime(a.getMessages()) });

  return (

    <div className={"chat-screen" + (mobileView === 'menu' ? ' mobile-menu-visible' : '')} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} >

      <ChatSelectorColumn chats={orderedChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} setModal={setModal} />

      {chats.map((c, i) => c.state === 'invalid' ? null : <ChatFrame key={i} hide={i !== selectedChat} chat={c} />)}
      {selectedChat === undefined && <div className="chat-frame"></div>}

    </div>
  );
};


function getLastMessageTime(messages) {
  if (messages.length === 0) return Number.MAX_SAFE_INTEGER;
  else return messages.slice(-1)[0].modified;
}
