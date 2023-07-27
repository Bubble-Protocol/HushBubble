import { ContentId, assert } from "@bubble-protocol/core";
import { ConversationBubble } from "./ConversationBubble";
import { EventManager } from "./utils/EventManager";
import { stateManager } from "../state-context";

const STATE = {
  connecting: 'connecting',
  open: 'open',
  reconnecting: 'reconnecting',
  failed: 'failed'
}

export class Conversation {

  unreadMsgs = 0;
  state = STATE.connecting;
  listeners = new EventManager(['new-message-notification', 'unread-change']);

  constructor(stateData, myId) {
    assert.isObject(stateData, 'stateData');
    const bubbleId = new ContentId(stateData.bubbleId);
    this.id = bubbleId.chain+'-'+bubbleId.contract;
    this.bubbleId = bubbleId;
    this.myId = myId;
    if (stateData.metadata) this._setMetadata(stateData.metadata);
    this.users = stateData.users;
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
    stateManager.register(this.id+'-unread', 0);
  }

  initialise(deviceKey) {
    this.bubble = new ConversationBubble(this.bubbleId, deviceKey);
    this.bubble.on('message', this._handleMessage.bind(this));
    return this.bubble.initialise(this.id)
      .then(this._setMetadata.bind(this))
      .then(() => { 
        this.lastRead = this.bubble.lastModTime;
        this.state = STATE.open 
      });
  }

  postMessage(message) {
    if (!this.bubble) throw new Error('conversation not initialised');
    assert.isObject(message, 'message');
    assert.isString(message.from, 'message.from');
    message.conversationId = this.id;
    return this.bubble.postMessage(message);
  }

  create(deviceKey, delegation, options) {
    this.bubble = new ConversationBubble(new ContentId(this.bubbleId), deviceKey, delegation);
    return this.bubble.create(this._getMetadata(), options)
      .then(() => { this.state = STATE.open });
  }

  join(applicationKey, deviceKey, delegation) { console.debug('joining conversation', applicationKey, deviceKey)
    const appBubble = new ConversationBubble(new ContentId(this.bubbleId), applicationKey);
    return appBubble.join(deviceKey)
      .then(() => {
        appBubble.close();
        return this.initialise(deviceKey, delegation);
      })
  }

  setReadTime(time) {
    this.lastRead = time;
    this._updateUnread();
  }

  close() {
    return this.bubble ? this.bubble.close() : Promise.resolve();
  }

  serialize() {
    return {id: this.id, bubbleId: this.bubbleId, metadata: this.metadata, users: this.users}
  }

  _handleMetadata(metadata) {
    this._setMetadata(metadata);
  }

  _handleMessage() {
    this.listeners.notifyListeners('new-message-notification');
    this._updateUnread();
  }

  _updateUnread() {
    this.unreadMsgs = this._countUnreadMsgs();
    console.debug(this.id+' unread', this.unreadMsgs)
    stateManager.dispatch(this.id+'-unread', this.unreadMsgs);
    this.listeners.notifyListeners('unread-change');
  }

  _getMetadata() {
    return {
      title: this.title,
      ...this.metadata
    }
  }

  _setMetadata(metadata) {
    this.title = metadata.title;
    this.metadata = {...metadata};
    delete(this.metadata.title);
  }

  _countUnreadMsgs() {
    let count = 0;
    let index = this.bubble.messages.length-1;
    while (index >= 0 && this.bubble.messages[index].modified > this.lastRead) {
      if (this.bubble.messages[index].from.id !== this.myId.id) count++;
      index--;
    }
    return count;  
  }

}
