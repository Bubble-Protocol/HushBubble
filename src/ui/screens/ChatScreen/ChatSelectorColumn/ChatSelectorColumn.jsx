import PropTypes from "prop-types";
import React, { useState } from "react";
import "./style.css";
import { ChatSelector } from "./ChatSelector";
import { ChevronsChevronsLeft } from "../../../icons/ChevronsChevronsLeft/ChevronsChevronsLeft";
import { stateManager } from "../../../../state-context";
import { IconChatSelector } from "./IconChatSelector";
import { Inbox } from "../../../icons/Inbox";
import { PopularPlus } from "../../../icons/PopularPlus";
import { ArrowLeft } from "../../../icons/ArrowLeft/ArrowLeft";
import { CopySelector } from "../../../components/CopySelector";
import { BubbleSelector } from "../../../components/BubbleSelector";
import { JoinChatModal } from "../../../modals/JoinChatModal";
import { CreateChatModal } from "../../../modals/CreateChatModal";
import { DeleteChatModal } from "../../../modals/DeleteChatModal";

export const ChatSelectorColumn = ({chats, selectedChat, setSelectedChat, setModal}) => {

  const online = stateManager.useStateData('online')();
  const unread = stateManager.useStateData('total-unread')();
  const myId = stateManager.useStateData('myId')();
  const config = stateManager.useStateData('config')();
  const session = stateManager.useStateData('session')();

  const [menuMinimized, setMenuMinimized] = useState(false);
  const [centrePanel, setCentrePanel] = useState('chat');

  // Modals

  function createChatModal(bubble) {
    return <CreateChatModal session={session} chains={config.chains} hosts={config.hosts} bubble={bubble} onCreate={session.createChat} onCancel={() => {setModal(null)}} onCompletion={() => {setModal(null); setCentrePanel('chat')}} />;
  } 


  return menuMinimized
    ?
      <div className="minimal-chat-column">
        <div className="inbox-icon">
          <Inbox />
        </div>
        <div className="dividing-line" />
        <div className="chat-list">
          {chats !== undefined &&
            chats.map((c, index) => {
              return <IconChatSelector key={index} chat={c} myId={myId} selected={index === selectedChat} onClick={() => setSelectedChat(index)} />
            })
          }
        </div>
          <div className="chat-column-footer no-mobile">
            <div className="mobile-menu-button" onClick={() => setMenuMinimized(false)} >
              <ChevronsChevronsLeft className="flip-horizontal" />
            </div>
          </div>
      </div>
    :
    <>
      {/* Chat Selector */}
      {centrePanel !== 'new-chat' &&
        <div className="chat-column">
            <div className="chat-column">
              <div className="title-item">
                <div className="selector-content">
                  <div className="selector-title-row">
                    <div className="title-item-title">Inbox</div>
                    <PopularPlus className="icon-plus button-like" color="#0F1217" onClick={() => setCentrePanel('new-chat')} />
                  </div>
                  <p className="p">{chats.length} conversation{chats.length === 1 ? '' : 's'}, {unread} unread message{unread === 1 ? '' : 's'}</p>
                </div>
              </div>
              <div className="dividing-line" />
              <div className="chat-list">
                {chats !== undefined &&
                  chats.map((c, index) => {
                    return <ChatSelector key={index} chat={c} myId={myId} selected={index === selectedChat} onClick={() => setSelectedChat(index)} />
                  })
                }
              </div>
              <div className="chat-column-footer no-mobile">
                <div className="mobile-menu-button" onClick={() => setMenuMinimized(true)} >
                  <ChevronsChevronsLeft />
                </div>
              </div>
            </div>
        </div>
      }

      {/* Join Chat */}
      {centrePanel === 'new-chat' &&
        <div className="chat-column">
          <div className="title-item">
            <div className="selector-content">
              <div className="selector-title-row">
                <div className="title-item-title">New Chat</div>
                <ArrowLeft className="icon-plus button-like" color="#0F1217" onClick={() => setCentrePanel('chat')} />
              </div>
            </div>
          </div>
          <div></div>
          <div className="bubble-list">
            <CopySelector title="Your Connection Link" subtitle="Share this link to allow others to send you connection requests." value={config.appUrl + '?connect=' + myId.id} />
            {
              config.bubbles.map((bubble, index) => {
                return <BubbleSelector key={index} title={bubble.title} icon={bubble.icon} description={bubble.description || ""} disabled={!online || bubble.disabled} onClick={() => setModal(createChatModal(bubble))} />
              })
            }
          </div>
        </div>
      }
      
    </>


};

ChatSelectorColumn.propTypes = {
  date: PropTypes.any,
};

