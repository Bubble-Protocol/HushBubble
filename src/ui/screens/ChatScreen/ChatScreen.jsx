import React, { useState } from "react";
import "./style.css";
import { ChatFrame } from "./ChatFrame";
import { stateManager } from "../../../state-context.js";
import { ChatSelectorColumn } from "./ChatSelectorColumn";

export const ChatScreen = ({mobileView, setMobileView, onTerminateChat, setModal}) => {

  const chats = stateManager.useStateData('chats')();

  // Sort chats
  const orderedChats = [...chats];
  orderedChats.sort((a,b) => { return getLastMessageTime(b.getMessages()) - getLastMessageTime(a.getMessages()) });
  
  const [selectedChat, setSelectedChat] = useState(orderedChats.length > 0 ? orderedChats[0] : undefined);

  if (selectedChat === undefined && orderedChats.length > 0) setSelectedChat(orderedChats[0]);

  function setSelectedChatExt(chat) {
    setSelectedChat(chat);
    setMobileView('chat');
  }

  return (

    <div className="chat-screen" >

      <ChatSelectorColumn className={mobileView === 'chat' ? 'no-mobile' : ''} chats={orderedChats} selectedChat={selectedChat} setSelectedChat={setSelectedChatExt} setModal={setModal} />

      {chats.map(c => c.state === 'invalid' ? null : <ChatFrame className={mobileView === 'menu' ? 'no-mobile' : ''} key={c.id} hide={c !== selectedChat} chat={c} onBack={() => setMobileView('menu')} onTerminate={onTerminateChat} setModal={setModal} />)}
      {selectedChat === undefined && <div className="chat-frame"></div>}

    </div>
  );
};


function getLastMessageTime(messages) {
  if (messages.length === 0) return Number.MAX_SAFE_INTEGER;
  else return messages.slice(-1)[0].modified;
}
