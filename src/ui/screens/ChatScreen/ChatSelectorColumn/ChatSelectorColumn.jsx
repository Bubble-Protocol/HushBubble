import PropTypes from "prop-types";
import React, { useState } from "react";
import "./style.css";
import { ChatSelector } from "./ChatSelector";
import { ChevronsChevronsLeft } from "../../../icons/ChevronsChevronsLeft/ChevronsChevronsLeft";
import { stateManager } from "../../../../state-context";
import { IconChatSelector } from "./IconChatSelector";
import { Inbox } from "../../../icons/Inbox";

export const ChatSelectorColumn = ({chats, selectedChat, setSelectedChat}) => {

  const unread = stateManager.useStateData('total-unread')();
  const myId = stateManager.useStateData('myId')();

  const [menuMinimized, setMenuMinimized] = useState(false);


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
    <div className="chat-column">
        <div className="chat-column">
          <div className="title-item">
            <div className="selector-content">
              <div className="selector-title-row">
                <div className="title-item-title">Inbox</div>
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
  
};

ChatSelectorColumn.propTypes = {
  date: PropTypes.any,
};

