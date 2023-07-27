import localStorage from "./utils/LocalStorage";
import { DEFAULT_CONFIG } from "./config";
import { Conversation } from "./Conversation";
import { User } from "./User";
import { stateManager } from "../state-context";

const APP_UID = "4cc22e0c9f762f7378a226f0b7f06d2101fe6f727995bcd331ed298addf3301b";
const DB_VERSION = 1;

const CONSTRUCTION_STATE = {
  closed: 'closed',
  new: 'new',
  contractDeployed: 'contract-deployed',
  open: 'open',
  connecting: 'connecting',
  failed: 'failed'
}

export class Session {

  constructionState = CONSTRUCTION_STATE.closed;
  id;
  deviceKey;
  conversations = [];


  constructor(chain, wallet, deviceKey) {
    this.chain = chain;
    this.wallet = wallet;
    this.deviceKey = deviceKey;
    this.myId = new User(this.deviceKey.cPublicKey);
    this.id = chain.id+'-default';
  }

  async open() {
    this.state = CONSTRUCTION_STATE.new;
    return this._loadState()
      .then(exists => {
        if (!exists) {
          this.conversations = [new Conversation({bubbleId: DEFAULT_CONFIG.bubbleId}, this.myId)];
          this.conversations[0].on('new-message-notification', this._handleNewMessage.bind(this));
          this.conversations[0].on('unread-change', this._handleUnreadChange.bind(this));
          this._saveState();
          return this.conversations[0].initialise(this.deviceKey);
        }
      })
  }

  async close() {
    return Promise.all(this.conversations.map(c => c.close()));
  }

  getUserId() { 
    return this.myId 
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
    const json = localStorage.read(APP_UID+'/'+this.id);
    if (!json) {
      return Promise.resolve(false);
    }
    else {
      const state = JSON.parse(json);
      const promises = [];
      state.conversations.forEach(rawC => {
        const conversation = new Conversation(rawC, this.myId);
        const promise = conversation.initialise(this.deviceKey)
          .then(() => {
            this.conversations.push(conversation);
          })
          .catch(error => {
            console.warn('failed to initialise conversation', error);
          });
        promises.push(promise);
      })
      if (promises.length > 0) return Promise.all(promises).then(() => true);
      else return Promise.resolve(true);
    }
  }

  _saveState() {
    const state = {
      version: DB_VERSION,
      conversations: this.conversations.map(c => c.serialize())
    }
    localStorage.write(APP_UID+'/'+this.id, JSON.stringify(state));
  }

}
