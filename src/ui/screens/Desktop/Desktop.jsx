import React, { useEffect, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ChatScreen } from "../ChatScreen/ChatScreen";
import { setFaviconWithCount } from "../../utils/favicon";

export const Desktop = () => {

  const [msgCount, setMsgCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const online = stateManager.useStateData('online')();
  const appState = stateManager.useStateData('app-state')();
  const chat = stateManager.useStateData('chat')();
  const newMsgCount = stateManager.useStateData('new-message-notification')();

  console.debug('Desktop', online, chat);

  if (newMsgCount > msgCount) {
    if (!document.hasFocus()) setFaviconWithCount(newMsgCount - unreadMsgCount);
    setMsgCount(newMsgCount);
  }

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        setUnreadMsgCount(newMsgCount);
        setFaviconWithCount(0);
      }
    }
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const html = (
    <div className="desktop">

      {/* Header */}
      <header className="header">
        <h1 className="title">HushBubble</h1>
        <div className="spacer" />
        {!online && <div className="connecting-indicator"><span>offline</span><span className="loader loader-small"></span></div> }
        <a className="header-link no-mobile" href="https://bubbleprotocol.com/chat/about.html">What is HushBubble?</a>
        <a className="header-link mobile" href="https://bubbleprotocol.com/chat/about.html">What is it?</a>
      </header>

      {/* Content */}
      <div className="content">

        {appState === 'initialised' && chat && <ChatScreen chat={chat} />}

      </div>

    </div>
  );

  return html;
};
