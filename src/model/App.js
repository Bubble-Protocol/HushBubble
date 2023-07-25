import { DEFAULT_CONFIG } from "./config";
import { stateManager } from "../state-context";
import { Conversation } from "./Conversation";
import localStorage from "./utils/LocalStorage";
import { ecdsa } from "@bubble-protocol/crypto";
import { User } from "./User";

const STATE = {
  uninitialised: 'uninitialised',
  initialised: 'initialised'
}

export class MessengerApp {

  state = STATE.uninitialised;
  deviceKey;
  newMsgCount = 0;

  constructor() {
    stateManager.register('app-state', this.state);
    stateManager.register('chats');
    stateManager.register('total-unread', 0);
    stateManager.register('new-message-notification');
    stateManager.register('online', window.navigator.onLine);
    stateManager.register('myId', undefined);
  }

  initialise() {
    this._loadState();
    if (!this.deviceKey) {
      this.deviceKey = new ecdsa.Key();
      this._saveState();
    }
    this.myId = new User(this.deviceKey.cPublicKey);
    this.conversations = [new Conversation(DEFAULT_CONFIG.bubbleId, this.myId)];
    this.conversations[0].on('new-message-notification', this._handleNewMessage.bind(this));
    this.conversations[0].on('unread-change', this._handleUnreadChange.bind(this));
    return this.conversations[0].initialise(this.deviceKey)
      .then(() => {
        this.state = STATE.initialised;
        stateManager.dispatch('myId', this.myId);
        stateManager.dispatch('chats', this.conversations);
        stateManager.dispatch('app-state', this.state);
      })
  }

  setOnlineStatus(online) {
    stateManager.dispatch('online', online);
  }

  async close() {
    return Promise.all(this.conversations.map(c => c.close()));
  }

  _handleNewMessage() {
    this.newMsgCount++;
    stateManager.dispatch('new-message-notification', this.newMsgCount);
  }

  _handleUnreadChange() {
    let unread = 0; this.conversations.forEach(c => { unread += c.unreadMsgs });
    console.debug('app unread', unread)
    stateManager.dispatch('total-unread', unread);
  }

  _loadState() {
    const json = localStorage.read('default');
    if (json) {
      const state = JSON.parse(json);
      this.deviceKey = new ecdsa.Key(state.deviceKey);
    }
  }

  _saveState() {
    const state = {
      deviceKey: this.deviceKey.privateKey
    }
    localStorage.write('default', JSON.stringify(state));
  }
}

