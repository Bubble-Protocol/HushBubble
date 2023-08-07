import localStorage from "./utils/LocalStorage";
import { DEFAULT_CONFIG } from "./config";
import { User } from "./User";
import { stateManager } from "../state-context";
import { ContentId, assert } from "@bubble-protocol/core";
import { testProviderExists } from "./utils/BubbleUtils";
import { PublicChat } from "./chats/PublicChat";
import { ChatFactory } from "./chats/ChatFactory";
import { ecdsa } from "@bubble-protocol/crypto";
import { Chat } from "./Chat";

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
  }

  async open() {
    console.trace('opening session', this);
    this.state = CONSTRUCTION_STATE.new;
    return this._loadState()
      .then(exists => {
        if (!exists) {
          const bubbleType = DEFAULT_CONFIG.bubbles.find(b => b.classType === 'PublicChat');
          this._addConversation(new PublicChat(bubbleType.id, DEFAULT_CONFIG.bubbleId, this.myId, this.deviceKey));
          this._saveState();
          return this.conversations[0].initialise();
        }
      })
  }

  async close() {
    return Promise.all(this.conversations.map(c => c.close()));
  }

  getUserId() { 
    return this.myId 
  }

  async createChat({chain, host, bubbleType, title, metadata={}}) {
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
    assert.isObject(metadata, 'metadata');

    console.trace("deploying", bubbleType.classType, "to chain", chain.id, "and provider", host.name);

    if (assert.isArray(metadata.members)) metadata.members = metadata.members.map(u => new User(u));

    const terminateKey = new ecdsa.Key().privateKey;

    // test provider exists then deploy encrypted application bubble (application id has access, use application key as encryption key)
    return testProviderExists(chain.id, host.chains[chain.id].url, chain.publicBubble)
      .then(() => {
        if (this.wallet.getChain() !== chain.id) return this.wallet.switchChain(chain.id)
      })
      .then(() => {
        console.trace('deploying chat contract');
        return this.wallet.deploy(bubbleType.sourceCode, ChatFactory.getConstructorParams(bubbleType.constructorParams, metadata, terminateKey));
        // return "0x2e37F1E6aEdEcEEa2e6A4b4aC5C75Dd26a2c8877";
      })
      .then(contractAddress => {
        console.trace('contract deployed with address', contractAddress);
        const bubbleId = new ContentId({
          chain: chain.id,
          contract: contractAddress,
          provider: host.chains[chain.id].url
        });
        const conversation = ChatFactory.constructChat(bubbleType.id, bubbleType.classType, bubbleId, this.myId, this.deviceKey, terminateKey, metadata);
        console.trace('creating off-chain bubble on host', conversation.contentId.provider);
        return conversation.create({
          metadata: {title, ...metadata},
          options: {silent: true}
        })
        .then(() => {
          console.trace('bubble created with content id', conversation.contentId);
          this._addNewConversation(conversation);
          return conversation.contentId;
        })
      })
  }

  _removeChat(conversation) {
    if (!this.conversations.includes(conversation)) return Promise.reject(new Error('no such chat'));
    this.conversations = this.conversations.filter(c => c !== conversation);
    this._saveState();
    stateManager.dispatch('chats', this.conversations)
  }

  async terminateChat(conversation) {
    const terminateKey = conversation.getTerminateKey();
    return this.wallet.send(conversation.contentId.contract, DEFAULT_CONFIG.bubbles[0].sourceCode.abi, 'terminate', [terminateKey])
      .then(() => conversation.terminate())
      .then(() => this._removeChat(conversation));
  }

  async joinChat(inviteStr) {
    assert.isString(inviteStr, "invite");
    let invite, bubbleId, classType;
    try {
      invite = Chat.parseInvite(inviteStr);
      bubbleId = new ContentId(invite.id);
      classType = invite.t;
    }
    catch(error) {
      console.warn(error);
      return Promise.reject(new Error('Invite is invalid', {cause: error}));
    }
    return this.wallet.getCode(bubbleId.contract)
      .then(code => {
        const codeHash = ecdsa.hash(code);
        console.trace('invite contract hash:', codeHash);
        let bubbleType = DEFAULT_CONFIG.bubbles.find(b => b.id.bytecodeHash === codeHash);
        // if (!bubbleType) bubbleType = DEFAULT_CONFIG.bubbles.find(b => b.classType === classType);
        if (!bubbleType) throw new Error('Chat type is not supported');
        let conversation;
        try {
          conversation = ChatFactory.constructChat(bubbleType.id, classType, bubbleId, this.myId, this.deviceKey);
        }
        catch(error) {
          console.warn(error);
          return Promise.reject(new Error('Invite is invalid', {cause: error}));
        }
        if (this.conversations.find(c => c.id === conversation.id)) return Promise.reject(new Error('You are already a member of this chat'));
        return conversation.join()
          .then(() => {
            this._addNewConversation(conversation);
          });
    })
  }

  hasConnectionWith(id) {
    try {
      const user = new User(id);
      return 0 <= this.conversations.findIndex(c => c.metadata.title === user.address);
    }
    catch(_) {
      return false;
    }
  }

  _addNewConversation(conversation) {
    if (!conversation.isValid()) throw new Error('chat is invalid');
    else {
      this._addConversation(conversation);
      this._saveState();
      stateManager.dispatch('chats', this.conversations)
    }
  }

  _addConversation(conversation) {
    conversation.on('new-message-notification', this._handleNewMessage.bind(this));
    conversation.on('unread-change', this._handleUnreadChange.bind(this));
    this.conversations.push(conversation);
  }

  _handleNewMessage() {
    this.newMsgCount++;
    stateManager.dispatch('new-message-notification', this.newMsgCount);
  }

  _handleUnreadChange() {
    let unread = 0; 
    this.conversations.forEach(c => { unread += c.unreadMsgs });
    stateManager.dispatch('total-unread', unread);
  }

  _loadState() {
    const json = localStorage.read(this.id);
    if (!json) {
      return Promise.resolve(false);
    }
    else {
      const state = JSON.parse(json);
      const promises = [];
      state.conversations.forEach(rawC => {
        console.trace('loaded chat', rawC);
        const valid = this._validateConversation(rawC);
        if (valid) {
          const conversation = ChatFactory.constructChat(rawC.chatType, rawC.classType, new ContentId(rawC.bubbleId), this.myId, this.deviceKey);
          const promise = conversation.initialise()
            .then(() => {
              if (!conversation.isValid()) console.warn('conversation', conversation.id, 'is invalid', conversation);
              else this._addConversation(conversation);
            })
            .catch(error => {
              console.warn('failed to initialise conversation', rawC.id, error);
          });
          promises.push(promise);
        }
      })
      if (promises.length > 0) return Promise.all(promises).then(() => true);
      else return Promise.resolve(true);
    }
  }

  _validateConversation(rawC) {
    try {
      new ContentId(rawC.bubbleId);
      return true;
    }
    catch(error) { 
      console.warn('saved chat is invalid', rawC, error.message)
      return false;
    }
  }

  _saveState() {
    const state = {
      conversations: this.conversations.map(c => c.serialize())
    }
    localStorage.write(this.id, JSON.stringify(state));
  }

}
