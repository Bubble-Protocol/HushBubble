import React, { useEffect, useState } from "react";
import "./style.css";
import { stateManager } from "../../../state-context";
import { ChatScreen } from "../ChatScreen/ChatScreen";
import { setFaviconWithCount } from "../../utils/favicon";
import { PopularMoreVertical1 } from "../../icons/PopularMoreVertical1/PopularMoreVertical1";
import { JoinChatModal } from "../../modals/JoinChatModal";
import { CreateChatModal } from "../../modals/CreateChatModal";
import { WelcomeScreen } from "../WelcomeScreen";

export const Desktop = () => {

  const unread = stateManager.useStateData('total-unread')();
  const online = stateManager.useStateData('online')();
  const urlParams = stateManager.useStateData('url-params')();
  const session = stateManager.useStateData('session')();
  const config = stateManager.useStateData('config')();
  const [mobileView, setMobileView] = useState('menu');

  useEffect(() => {
    if (!session || !urlParams) return;
    if (urlParams.connect && !session.hasConnectionWith(urlParams.connect)) {
      setModal(<CreateChatModal session={session} chains={config.chains} hosts={config.hosts} bubble={config.bubbles.find(b => b.id.category === 'one-to-one')} valuesIn={[null, urlParams.connect]} onCreate={session.createChat} onCancel={() => setModal(null)} onCompletion={() => setModal(null)} />);
    }
    else if (urlParams.join) {
      setModal(<JoinChatModal onJoin={session.joinChat} bubbleIn={urlParams.join} onCompletion={() => setModal(null)} onCancel={() => setModal(null)} />);
    }
  }, [session])

  setFaviconWithCount(unread);

  // Setup Modals

  const [modal, setModal] = useState(null); 

  function terminateChat(chat) {
    return session.terminateChat(chat);
  }
    
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

        {!session && <WelcomeScreen />}
        {session && <ChatScreen mobileView={mobileView} setMobileView={setMobileView} setModal={setModal} onTerminateChat={terminateChat} />}

      </div>

      {/* Modals */}
      {modal && <div className="modalMask"/>}
      {modal}

    </div>
  );

  return html;
};
