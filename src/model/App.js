import { DEFAULT_CONFIG } from "./config";
import { stateManager } from "../state-context";
import localStorage from "./utils/LocalStorage";
import { ecdsa } from "@bubble-protocol/crypto";
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
    stateManager.register('chat-functions');
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
    this.wallet.connect().catch(error => console.warn('failed to connect wallet', error));
    this.session = new Session(DEFAULT_CONFIG.chains[4], this.wallet, this.deviceKey);
    stateManager.register('session', this.session);
    return this.session.open()
      .then(() => {
        this.state = STATE.initialised;
        stateManager.dispatch('myId', this.session.myId);
        stateManager.dispatch('chats', this.session.conversations);
        stateManager.dispatch('app-state', this.state);
        stateManager.dispatch('chat-functions', {
          onTerminate: this.session.terminateChat.bind(this.session)
        });
      });
  }

  setOnlineStatus(online) {
    console.trace(online ? 'online' : 'offline');
    stateManager.dispatch('online', online);
    if (online === true) this.session.reconnect();
  }

  async close() {
    if (this.session) this.session.close();
    if (this.wallet) this.wallet.disconnect();
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

