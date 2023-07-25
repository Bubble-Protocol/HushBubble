import React, { useState } from "react";
import "./style.css";
import { ChatFrame } from "./ChatFrame";
import { stateManager } from "../../../state-context.js";

export const ChatScreen = () => {

  const chats = stateManager.useStateData('chats')();

  const [selectedChat, setSelectedChat] = useState(chats.length > 0 ? 0 : undefined);
  if (selectedChat === undefined && chats.length > 0) setSelectedChat(0);

  chats.sort((a,b) => { return getLastMessageTime(b) - getLastMessageTime(a) });

  return (

    <div className="chat-screen" >

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
