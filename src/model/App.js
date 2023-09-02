import { DEFAULT_CONFIG } from "./config";
import { stateManager } from "../state-context";
import localStorage from "./utils/LocalStorage";
import { ecdsa } from "@bubble-protocol/crypto";
import { Session } from "./Session";
import { MetamaskWallet } from "./wallets/MetamaskWallet";

const STATE = {
  uninitialised: 'uninitialised',
  noWallet: 'no-wallet',
  initialised: 'initialised',
  switching: 'switching-session'
}

export class MessengerApp {

  state = STATE.uninitialised;
  wallet;
  deviceKey;
  newMsgCount = 0;

  constructor() {
    stateManager.register('app-state', this.state);
    stateManager.register('wallet');
    stateManager.register('session');
    stateManager.register('chats');
    stateManager.register('chat-functions');
    stateManager.register('total-unread', 0);
    stateManager.register('new-message-notification');
    stateManager.register('online', window.navigator.onLine);
    stateManager.register('myId', undefined);
    stateManager.register('config', DEFAULT_CONFIG);
    stateManager.register('join-request');
    stateManager.register('wallet-functions', {
      connect: this.connectWallet.bind(this),
      disconnect: this.disconnectWallet.bind(this),
      delegate: this.disconnectWallet.bind(this),
      getAccounts: this.getAccounts.bind(this),
      switchAccount: this.switchAccount.bind(this)
    });
  }

  initialise() {
    const wallet = new MetamaskWallet();
    const lastSession = this._loadState();
    if (!this.deviceKey) {
      this.deviceKey = new ecdsa.Key();
      this._saveState();
    }
    if (!lastSession) {
      this._setAppState(STATE.initialised);
      return wallet.isAvailable();
    }
    return wallet.isAvailable()
      .then(available => {
        if (!available) this._setAppState(STATE.noWallet);
        else {
          return wallet.connect()
          .then(() => {
            this.wallet = wallet;
            return this._openSession(lastSession)
          })
          .then(() => {
            this._setAppState(STATE.initialised);
          })
        }
      })
      .catch(console.warn);
  }

  setOnlineStatus(online) {
    console.trace(online ? 'online' : 'offline');
    stateManager.dispatch('online', online);
    if (online === true) this.checkConnections();
  }

  checkConnections() {
    if (this.session) this.session.reconnect();
  }

  async close() {
    if (this.session) this.session.close();
    if (this.wallet) this.wallet.disconnect();
  }

  async connectWallet(delegate) {
    console.trace('connect wallet', delegate ? delegate : '', this.session)
    if (this.wallet && this.session) return Promise.resolve();
    else if (this.wallet) return this._openSession(this.wallet.getAccount(), delegate);
    else {
      const wallet = new MetamaskWallet();
      return wallet.connect()
        .then(() => {
          this.wallet = wallet;
          stateManager.dispatch('wallet', this.wallet);
          return this._openSession(this.wallet.getAccount(), delegate);
        })
    }
  }

  async disconnectWallet() {
    if (!this.wallet) return Promise.resolve();
    return this.wallet.disconnect()
      .then(() => {
        stateManager.dispatch('wallet', undefined);
        return this._closeSession();
      })
  }

  async _openSession(id, delegate) {
    const session = new Session(id);
    return session.open(this.wallet, delegate)
      .then(() => {
        this.session = session;
        this._saveState();
        stateManager.dispatch('session', this.session);
        stateManager.dispatch('myId', this.session.myId);
        stateManager.dispatch('chats', this.session.conversations);
        stateManager.dispatch('chat-functions', {
          create: this.session.createChat.bind(this.session),
          join: this.session.joinChat.bind(this.session),
          terminate: this.session.terminateChat.bind(this.session),
          manageMembers: this.session.manageMembers.bind(this.session),
          leave: this.session.leaveChat.bind(this.session),
        });
      });
  }

  getAccounts() {
    const storedValues = localStorage.read();
    return Object.keys(storedValues).filter(v => ecdsa.assert.isAddress(v))
     .map(key => {
       return {account: key, title: storedValues[key].userTitle, icon: storedValues[key].userIcon}
     })
  }

  async switchAccount(id) {
    this._setAppState(STATE.switching);
    return this._closeSession()
      .then(() => this._openSession(id))
      .then(() => this._setAppState(STATE.initialised));
  }

  async _closeSession() {
    if (!this.session) return Promise.resolve();
    return this.session.close()
      .then(() => {
        this.session = undefined;
        this._saveState();
        stateManager.dispatch('session', this.session);
      })
  }

  _loadState() {
    const json = localStorage.read('default');
    if (json) {
      const state = JSON.parse(json);
      this.deviceKey = new ecdsa.Key(state.deviceKey);
      return state.lastSession;
    }
  }

  _saveState() {
    const state = {
      deviceKey: this.deviceKey.privateKey,
      lastSession: this.session ? this.session.id : undefined
    }
    localStorage.write('default', JSON.stringify(state));
  }

  _setAppState(state) {
    this.state = state;
    stateManager.dispatch('app-state', this.state);
    console.debug('app-state', this.state)
  }

}

