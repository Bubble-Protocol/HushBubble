import React, { useEffect } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ChatScreen } from "../ChatScreen/ChatScreen";
import { setFaviconWithCount } from "../../utils/favicon";

export const Desktop = () => {

  const unread = stateManager.useStateData('total-unread')();
  const online = stateManager.useStateData('online')();
  const appState = stateManager.useStateData('app-state')();

  console.debug('Desktop', online);

  setFaviconWithCount(unread);

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

        {appState === 'initialised' && <ChatScreen />}

      </div>

    </div>
  );

  return html;
};
