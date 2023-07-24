import React, { useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ChatScreen } from "../ChatScreen/ChatScreen";
import ping from '../../assets/audio/ping.mp3';

export const Desktop = () => {

  const [msgCount, setMsgCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const online = stateManager.useStateData('online')();
  const appState = stateManager.useStateData('app-state')();
  const chat = stateManager.useStateData('chat')();
  const newMsgCount = stateManager.useStateData('new-message-notification')();

  const audioPing = new Audio(ping);

  console.debug('Desktop', online, chat);

  if (newMsgCount > msgCount) {
    if (!document.hasFocus()) audioPing.play();
    setMsgCount(newMsgCount);
  }

  const html = (
    <div className="desktop">

      {/* Header */}
      <header className="header">
        <h1 className="title">HushBubble</h1>
        <div className="spacer" />
        {!online && <div className="connecting-indicator"><span>offline</span><span className="loader loader-small"></span></div> }
        <a class="header-link no-mobile" href="https://bubbleprotocol.com/chat/about.html">What is HushBubble?</a>
        <a class="header-link mobile" href="https://bubbleprotocol.com/chat/about.html">What is it?</a>
      </header>

      {/* Content */}
      <div className="content">

        {appState === 'initialised' && chat && <ChatScreen chat={chat} />}

      </div>

    </div>
  );

  return html;
};
