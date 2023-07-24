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
    this.conversation = new Conversation(DEFAULT_CONFIG.bubbleId);
    stateManager.register('app-state', this.state);
    stateManager.register('chat');
    stateManager.register('new-message-notification');
    stateManager.register('online', window.navigator.onLine);
    stateManager.register('myId', undefined);
    this.conversation.on('new-message-notification', this._handleNewMessage.bind(this));
  }

  initialise() {
    this._loadState();
    if (!this.deviceKey) {
      this.deviceKey = new ecdsa.Key();
      this._saveState();
    }
    return this.conversation.initialise(this.deviceKey)
      .then(() => {
        this.state = STATE.initialised;
        stateManager.dispatch('myId', new User(this.deviceKey.cPublicKey));
        stateManager.dispatch('chat', this.conversation);
        stateManager.dispatch('app-state', this.state);
      })
  }

  setOnlineStatus(online) {
    stateManager.dispatch('online', online);
  }

  async close() {
    return this.conversation.close();
  }

  _handleNewMessage() {
    this.newMsgCount++;
    stateManager.dispatch('new-message-notification', this.newMsgCount);
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

