import { DEFAULT_CONFIG } from "./config";
import { stateManager } from "../state-context";
import localStorage from "./utils/LocalStorage";
import { ecdsa } from "@bubble-protocol/crypto";
import { Session } from "./Session";
import { RainbowKitWallet } from "./wallets/RainbowKitWallet";

const STATE = {
  uninitialised: 'uninitialised',
  initialising: 'initialising',
  noWallet: 'no-wallet',
  disconnected: 'disconnected',
  notLoggedIn: 'not-logged-in',
  loggingIn: 'logging-in',
  loggedIn: 'logged-in',
  switching: 'switching-session'
}

export class MessengerApp {

  state = STATE.uninitialised;
  wallet;
  deviceKey;
  newMsgCount = 0;

  constructor() {
    this._handleWalletConnected = this._handleWalletConnected.bind(this);
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
      logIn: this.logIn.bind(this),
      disconnect: this.disconnectWallet.bind(this),
      delegate: this.disconnectWallet.bind(this),
      getAccounts: this.getAccounts.bind(this),
      switchAccount: this.switchAccount.bind(this)
    });
  }

  initialise() {
    this._setAppState(STATE.initialising);
    this.wallet = new RainbowKitWallet();
    stateManager.dispatch('wallet', this.wallet);
    this.wallet.on('connected', this._handleWalletConnected);
    const lastSession = this._loadState();
    if (!this.deviceKey) {
      this.deviceKey = new ecdsa.Key();
      this._saveState();
    }
    if (!lastSession) {
      return this.wallet.isAvailable()
        .then(available => {
          this._setAppState(available ? STATE.disconnected : STATE.noWallet);
        })
    }
    return this.wallet.isAvailable()
      .then(available => {
        if (!available) this._setAppState(STATE.noWallet);
        else {
          return this.wallet.connect()
          .then(() => {
            return this._openSession(lastSession)
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

  async logIn() {
    this._setAppState(STATE.loggingIn);
    return this.session.logIn()
      .finally(() => {
        this._setAppState(this.session.state === 'not-logged-in' ? STATE.notLoggedIn : STATE.loggedIn);
      });
  }

  async disconnectWallet() {
    if (!this.wallet) return Promise.resolve();
    return this.wallet.disconnect()
      .then(() => {
        stateManager.dispatch('wallet', undefined);
        return this._closeSession();
      })
      .then(() => {
        this._setAppState(STATE.noWallet);
      })
  }

  async _openSession(id) {
    const session = new Session(id);
    return session.open(this.wallet)
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
        this._setAppState(this.session.state === 'not-logged-in' ? STATE.notLoggedIn : STATE.loggedIn);
      })
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
      .then(() => this._setAppState(STATE.loggedIn));
  }

  _handleWalletConnected() {
    this._openSession(this.wallet.getAccount().toLowerCase())
      .catch(error => {
        console.warn(error);
        this.wallet.disconnect();
      })
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
  }

}

