import { ContentId, assert } from "@bubble-protocol/core";
import { ConversationBubble } from "./ConversationBubble";

const STATE = {
  connecting: 'connecting',
  open: 'open',
  reconnecting: 'reconnecting',
  failed: 'failed'
}

export class Conversation {

  messages = [];
  state = STATE.connecting;

  constructor(bubbleId) {
    assert.isInstanceOf(bubbleId, ContentId, 'bubbleId');
    this.id = bubbleId.chain+'-'+bubbleId.contract;
    this.bubbleId = bubbleId;
  }

  initialise(deviceKey) {
    this.bubble = new ConversationBubble(this.bubbleId, deviceKey);
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

  _setupBubbleListeners() {
    this.bubble.on('metadata', this._handleMetadata.bind(this));
    this.bubble.on('message', (...params) => this.listeners.notifyListeners('update-content', ...params));
    this.bubble.on('state-change', (state, error) => console.trace('conversation', this.id, 'state changed to', state, error));
    this.bubble.on('state-change', (...params) => { console.debug('Conversation: state-change', ...params); this.listeners.notifyListeners('connection-state-change', ...params)});
    this.bubble.on('error', (...params) => console.warn('Conversation', this.id, 'bubble error', ...params)); 
    this.listeners.notifyListeners('connection-state-change', this.bubble.getConnectionState());
  }

}

