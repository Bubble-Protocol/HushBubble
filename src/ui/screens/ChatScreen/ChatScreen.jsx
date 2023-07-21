import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import { ChatFrame } from "./ChatFrame";

export const ChatScreen = ({chat}) => {

  console.debug('chat object', chat)
  return (

    <div className="chat-screen" >
      <div className="chat-frame">
        <ChatFrame chat={chat} />    
      </div>

    </div>
  );
};

ChatScreen.propTypes = {
  chat: PropTypes.object.isRequired,
};

