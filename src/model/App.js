import { DEFAULT_CONFIG } from "./config";
import { stateManager } from "../state-context";
import { Conversation } from "./Conversation";
import localStorage from "./utils/LocalStorage";
import { ecdsa } from "@bubble-protocol/crypto";
import { User } from "./User";
import { HushBubbleCentralWallet } from "./wallets/HushBubbleCentralWallet";
import { Session } from "./Session";

const STATE = {
  uninitialised: 'uninitialised',
  initialised: 'initialised'
}

export class MessengerApp {

  state = STATE.uninitialised;
  wallet;
  deviceKey;
  newMsgCount = 0;

  constructor() {
    stateManager.register('app-state', this.state);
    stateManager.register('chats');
    stateManager.register('total-unread', 0);
    stateManager.register('new-message-notification');
    stateManager.register('online', window.navigator.onLine);
    stateManager.register('myId', undefined);
    stateManager.register('config', DEFAULT_CONFIG);
  }

  initialise() {
    this._loadState();
    if (!this.deviceKey) {
      this.deviceKey = new ecdsa.Key();
      this._saveState();
    }
    this.wallet = new HushBubbleCentralWallet(this.deviceKey);
    this.session = new Session(DEFAULT_CONFIG.chains[4], this.wallet, this.deviceKey);
    stateManager.register('session', this.session);
    return this.session.open()
      .then(() => {
        this.state = STATE.initialised;
        stateManager.dispatch('myId', this.session.myId);
        stateManager.dispatch('chats', this.session.conversations);
        stateManager.dispatch('app-state', this.state);
      });
  }

  setOnlineStatus(online) {
    stateManager.dispatch('online', online);
  }

  async close() {
    if (this.session) this.session.close();
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

