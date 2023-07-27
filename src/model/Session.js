import localStorage from "./utils/LocalStorage";
import { DEFAULT_CONFIG } from "./config";
import { Conversation } from "./Conversation";
import { User } from "./User";
import { stateManager } from "../state-context";
import { assert } from "@bubble-protocol/core";
import { testProviderExists } from "./utils/BubbleUtils";

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
    this.joinChat = this.joinChat.bind(this);
    this.createChat = this.createChat.bind(this);
    this.terminateChat = this.terminateChat.bind(this);
    this.removeChat = this.removeChat.bind(this);
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

  async createChat({chain, host, bubbleType, title, users, metadata}) {
    assert.isObject(chain, 'chain');
    assert.isNumber(chain.id, 'chain.id');
    assert.isHexString(chain.publicBubble, 'chain.publicBubble');
    assert.isObject(host, 'host');
    assert.isObject(host.chains, 'host.chains');
    assert.isObject(host.chains[chain.id], 'host.chains for chain id '+chain.id);
    assert.isString(host.chains[chain.id].url, 'host.chains[].url');
    assert.isObject(bubbleType, 'bubbleType');
    assert.isObject(bubbleType.sourceCode, 'bubbleType.sourceCode');
    assert.isArray(bubbleType.sourceCode.abi, 'bubbleType.sourceCode.abi');
    assert.isHexString(bubbleType.sourceCode.bin || bubbleType.sourceCode.bytecode, 'bubbleType.sourceCode.bin (or bubbleType.sourceCode.bytecode)');
    assert.isArray(users, 'users');

    console.trace("deploying conversation to chain", chain.id, "and provider", host.provider, 'with users', users);

    const members = users.map(u => new User(u));
    console.debug('members', members);

    // test provider exists then deploy encrypted application bubble (application id has access, use application key as encryption key)
    return testProviderExists(chain.id, host.chains[chain.id].url, chain.publicBubble)
      .then(() => {
        if (this.wallet.getChain() !== chain.id) return this.wallet.switchChain(chain.id)
      })
      .then(() => {
        console.trace('deploying chat contract');
        return this.wallet.deploy(bubbleType.sourceCode, members.map(m => m.address));
      })
      .then(contractAddress => {
        console.trace('contract deployed with address', contractAddress);
        const conversation = new Conversation({
          bubbleId: {
            chain: chain.id,
            contract: contractAddress,
            provider: host.chains[chain.id].url
          },
          title: title,
          members: members,
          metadata: metadata
        });
        console.trace('creating off-chain bubble on host', conversation.bubbleId.provider);
        return conversation.create(this.deviceKey, this.delegation, {silent: true})
          .then(() => {
            console.trace('bubble created with content id', conversation.bubbleId);
            this._addConversation(conversation);
            return conversation.bubbleId;
          })
      })
  }

  removeChat(conversation) {
    if (!this.conversations.includes(conversation)) return Promise.reject(new Error('no such chat'));
    this.conversations = this.conversations.filter(c => c !== conversation);
    this._saveState();
    stateManager.dispatch('chats', this.conversations)
  }

  async terminateChat(conversation) {
    return this.wallet.send(conversation.bubbleId.contract, DEFAULT_CONFIG.bubbles[0].sourceCode, 'terminate')
      .then(() => this.removeConversation(conversation));
  }

  async joinChat(bubbleId) {
    const conversation = new Conversation({bubbleId});
    if (this.conversations.find(c => c.id === conversation.id)) return Promise.reject(new Error('You are already a member of this chat'));
    return conversation.join(this.deviceKey, this.deviceKey)
      .then(() => {
        this._addConversation(conversation);
      });
  }

  _addConversation(conversation) {
    this.conversations.push(conversation);
    this._saveState();
    stateManager.dispatch('chats', this.conversations)
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
