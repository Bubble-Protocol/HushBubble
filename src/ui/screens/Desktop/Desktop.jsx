import React, { useRef, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ChatScreen } from "../ChatScreen/ChatScreen";
import { setFaviconWithCount } from "../../utils/favicon";
import { PopularMoreVertical1 } from "../../icons/PopularMoreVertical1/PopularMoreVertical1";

export const Desktop = () => {

  const unread = stateManager.useStateData('total-unread')();
  const online = stateManager.useStateData('online')();
  const appState = stateManager.useStateData('app-state')();
  const [mobileView, setMobileView] = useState('chat');

  console.debug('Desktop', online);

  setFaviconWithCount(unread);

  // Setup Modals

  const [modal, setModal] = useState(null);    
    
  const html = (
    <div className="desktop">

      {/* Header */}
      <header className="header">
        <div className="mobile-menu-button mobile" onClick={() => setMobileView(mobileView === 'chat' ? 'menu' : 'chat')}>
          <PopularMoreVertical1 className="mobile" size="32px" color="#cccccc" />
          {unread !== 0 && <span className="mobile-menu-notification mobile">{unread}</span>}
        </div>
        <h1 className="title">HushBubble</h1>
        <div className="spacer" />
        {!online && <div className="connecting-indicator"><span>offline</span><span className="loader loader-small"></span></div> }
        <a className="header-link no-mobile" href="https://bubbleprotocol.com/chat/about.html">What is HushBubble?</a>
        <a className="header-link mobile" href="https://bubbleprotocol.com/chat/about.html">What is it?</a>
      </header>

      {/* Content */}
      <div className="content">

        {appState === 'initialised' && <ChatScreen mobileView={mobileView} setMobileView={setMobileView} setModal={setModal} />}

      </div>

      {/* Modals */}
      {modal && <div className="modalMask"/>}
      {modal}

    </div>
  );

  return html;
};
