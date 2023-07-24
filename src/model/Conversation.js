import { ContentId, assert } from "@bubble-protocol/core";
import { ConversationBubble } from "./ConversationBubble";
import { EventManager } from "./utils/EventManager";

const STATE = {
  connecting: 'connecting',
  open: 'open',
  reconnecting: 'reconnecting',
  failed: 'failed'
}

export class Conversation {

  messages = [];
  state = STATE.connecting;
  listeners = new EventManager(['new-message-notification']);

  constructor(bubbleId) {
    assert.isInstanceOf(bubbleId, ContentId, 'bubbleId');
    this.id = bubbleId.chain+'-'+bubbleId.contract;
    this.bubbleId = bubbleId;
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  initialise(deviceKey) {
    this.bubble = new ConversationBubble(this.bubbleId, deviceKey);
    this.bubble.on('message', () => this.listeners.notifyListeners('new-message-notification'));
    return this.bubble.initialise(this.id)
      .then(this._setMetadata.bind(this))
      .then(() => { 
        this.lastRead = this.bubble.lastModTime;
        this.messages = this.bubble.messages;
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

  setReadTime(time) {
    this.lastRead = time;
  }

  close() {
    return this.bubble ? this.bubble.close() : Promise.resolve();
  }

  _handleMetadata(metadata) {
    this._setMetadata(metadata);

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

}

