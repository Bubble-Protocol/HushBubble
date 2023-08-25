import localStorage from "./utils/LocalStorage";
import { DEFAULT_CONFIG } from "./config";
import { User } from "./User";
import { stateManager } from "../state-context";
import { ContentId, assert } from "@bubble-protocol/core";
import { Delegation, toDelegateSignFunction } from "@bubble-protocol/client";
import { testProviderExists } from "./utils/BubbleUtils";
import { ChatFactory } from "./chats/ChatFactory";
import { ecdsa } from "@bubble-protocol/crypto";
import { Chat } from "./Chat";
import { HushBubbleConnectRelay } from "./services/HushBubbleConnectRelay";
import { ParamFactory } from "./chats/ParamFactory";
import { ProfileRegistry } from "./services/ProfileRegistry";
import { Contacts } from "./Contacts";
import { Wallet } from "./Wallet";

const CONSTRUCTION_STATE = {
  closed: 'closed',
  new: 'new',
  contractDeployed: 'contract-deployed',
  open: 'open',
  connecting: 'connecting',
  failed: 'failed'
}

const DEFAULT_SETTINGS = {
  connectionRelay: 'HushBubbleConnectRelay',
  defaultChain: DEFAULT_CONFIG.defaultChainId
}

export class Session {

  constructionState = CONSTRUCTION_STATE.closed;
  account;
  id;
  wallet;
  sessionKey;
  keyDelegation;
  settings = DEFAULT_SETTINGS;
  conversations = [];

  constructor(id) {
    this.id = id;
    this.joinChat = this.joinChat.bind(this);
    this.createChat = this.createChat.bind(this);
    this.terminateChat = this.terminateChat.bind(this);
  }

  async open(wallet, delegate) {
    console.trace('opening session', this);
    assert.isInstanceOf(wallet, Wallet, 'wallet');
    this.wallet = wallet;
    this.state = CONSTRUCTION_STATE.new;
    return this._loadState()
      .then(exists => {
        if (!exists) {
          this.sessionKey = new ecdsa.Key();
          this.myId = new User({account: this.id, delegate: this.sessionKey.cPublicKey});
          this._saveState();
        }
      })
      .then(() => {
        if (!this.keyDelegation) {
          if (!assert.isInstanceOf(delegate, Delegation)) {
            const delegation = new Delegation(this.myId.delegate.address, 'never');
            delegation.permitAccessToAllBubbles();
            throw {code: 'requires-delegate', message: 'session requires delegate', delegateRequest: {delegation}};
          }
          return delegate.sign(this.wallet.getSignFunction())
            .then(() => {
              this.keyDelegation = delegate;
              this._saveState();
            })
        }
      })
      .then(() => {
        if (this.settings.connectionRelay) {
          this.connectionRelay = new HushBubbleConnectRelay(this.sessionKey, this.joinChat.bind(this));
          return this.connectionRelay.monitor();
        }
      })
      .then(() => {
        this.profileRegistry = new ProfileRegistry(
          this.myId.account, 
          toDelegateSignFunction(this.sessionKey.signFunction, this.keyDelegation), 
          this._handleProfileUpdate.bind(this)
        );
        this.contacts = new Contacts(this.profileRegistry);
        return this.profileRegistry.initialise();
      })
      .then(this._initialiseConversations.bind(this));
  }

  async reconnect() {
    this.conversations.map(c => c.reconnect());
    if (this.connectionRelay) this.connectionRelay.reconnect();
    if (this.profileRegistry) this.profileRegistry.reconnect();
  }

  async close() {
    const promises = this.conversations.map(c => c.close());
    if (this.connectionRelay) promises.push(this.connectionRelay.close());
    if (this.profileRegistry) promises.push(this.profileRegistry.close());
    return Promise.all(promises);
  }

  getUserId() { 
    return this.myId 
  }

  async createChat({chain, host, bubbleType, params={}}) {
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
    assert.isObject(params, 'params');

    console.trace("deploying", bubbleType.classType, "to chain", chain.id, "and provider", host.name);

    // get smart contract constructor parameters
    const terminateKey = new ecdsa.Key().privateKey;
    params.terminateKey = terminateKey;
    params.myId = this.myId;
    const constructorParams = ParamFactory.getParamsAsArray(bubbleType.constructorParams, params);

    // get metadata and initialise the member array
    const metadata = ParamFactory.getParams(bubbleType.metadata, params);
    if (metadata.member0) metadata.member0 = new User(metadata.member0);
    if (metadata.member1) metadata.member1 = new User(metadata.member1);
    metadata.members = getMembers(this.myId, metadata);

    // test provider exists then deploy encrypted application bubble (application id has access, use application key as encryption key)
    return testProviderExists(chain.id, host.chains[chain.id].url, chain.publicBubble)
      .then(() => {
        if (this.wallet.getChain() !== chain.id) return this.wallet.switchChain(chain.id, chain.name)
      })
      .then(() => {
        console.trace('deploying chat contract', bubbleType.title, constructorParams);
        return this.wallet.deploy(bubbleType.sourceCode, constructorParams);
        // return "0x5Ec6A3284049E8b3e5966882fd3D40FCFB839501";
      })
      .then(contractAddress => {
        console.trace('contract deployed with address', contractAddress);
        const bubbleId = new ContentId({
          chain: chain.id,
          contract: contractAddress,
          provider: host.chains[chain.id].url
        });
        const conversation = ChatFactory.constructChat(bubbleType.id, bubbleId, metadata, this.myId, this.sessionKey, terminateKey, this.keyDelegation, this.contacts, metadata);
        console.trace('creating off-chain bubble on host', conversation.contentId.provider);
        return conversation.create({
          metadata: metadata,
          options: {silent: true}
        })
        .then(() => {
          console.trace('bubble created with content id', conversation.contentId);
          this._addNewConversation(conversation);
          return conversation;
        })
      })
      .then(conversation => {
        if (conversation.chatType.id.category === 'one-to-one' && this.connectionRelay) {
          this.connectionRelay.notify(conversation.userManager.users[0].publicKey, conversation.getInvite());
        }
        return conversation.contentId;
      })
  }

  async terminateChat(conversation) {
    const terminateKey = conversation.getTerminateKey();
    console.trace('terminating contract', conversation.contentId.contract, 'with key', terminateKey, 'and abi', conversation.chatType.sourceCode.abi);
    return this.wallet.send(conversation.contentId.contract, conversation.chatType.sourceCode.abi, 'terminate', [terminateKey])
      .then(() => conversation.terminate())
      .then(() => this._removeChat(conversation));
  }

  async joinChat(inviteStr) {
    assert.isString(inviteStr, "invite");
    let invite, bubbleId, bubbleProvider;
    try {
      invite = Chat.parseInvite(inviteStr);
      bubbleId = new ContentId(invite.id || invite);
      bubbleProvider = new URL(bubbleId.provider);
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
          conversation = ChatFactory.constructChat(bubbleType.id, bubbleId, undefined, this.myId, this.sessionKey, undefined, this.keyDelegation, this.contacts);
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

  manageMembers({chat, addedMembers, removedMembers}) {
    try {
      assert.isInstanceOf(chat, Chat, 'chat');
      assert.isArray(addedMembers, 'addedMembers');
      assert.isArray(removedMembers, 'removedMembers');
      const newMembers = chat.metadata.members.filter(m => !removedMembers.includes(m)).concat(addedMembers);
      console.trace(chat.id, 'setting new members', newMembers);
      return Promise.resolve()
      .then(() => {
        console.trace(chat.id, 'adding new members')
        return addedMembers.length === 0 ? Promise.resolve() : 
          this.wallet.send(
            chat.contentId.contract, 
            chat.chatType.sourceCode.abi,
            chat.chatType.actions.addMembers.method,
            ParamFactory.getParamsAsArray(chat.chatType.actions.addMembers.params, {members: addedMembers})
          )
      })
      .then(() => {
        console.trace(chat.id, 'removing old members')
        return removedMembers.length === 0 ? Promise.resolve() : 
          this.wallet.send(
            chat.contentId.contract, 
            chat.chatType.sourceCode.abi,
            chat.chatType.actions.removeMembers.method,
            ParamFactory.getParamsAsArray(chat.chatType.actions.removeMembers.params, {members: removedMembers})
          )
      })
      .then(() => {
        console.trace(chat.id, "writing new users' metadata files")
        return Promise.all(addedMembers.map(m => chat.userManager.addUser(m.publicKey)));
      })
      .then(() => {
        console.trace(chat.id, "removing old users' metadata files")
        return Promise.all(removedMembers.map(m => chat.userManager.removeUser(m.publicKey, {silent: true})));
      })
      .then(() => {
        console.trace(chat.id, 'saving new metadata to bubble')
        return chat.setMetadata({members: newMembers});
      })
    }
    catch(error) {
      return Promise.reject(error);
    }
  }

  leaveChat(chat) {
    console.trace('leaving chat', chat.id);
    return Promise.resolve()
      .then(() => {
        this._removeChat(chat);
      })
  }

  hasConnectionWith(id) {
    try {
      const user = new User(id);
      return 0 <= this.conversations.findIndex(c => c.metadata.title === user.getAccount());
    }
    catch(_) {
      return false;
    }
  }

  updateProfile(profile) {
    assert.isObject(profile, 'profile');
    this._handleProfileUpdate(profile);
    return this.profileRegistry.setMyProfile(profile);
  }

  getDefaultChainId() {
    return this.settings.defaultChain;
  }

  _handleProfileUpdate(profile) {
    if (profile.title !== undefined) profile.title = profile.title.trim();
    if (profile.title === '') profile.title = undefined;
    this.myId.title = profile.title;
    this.myId.icon = profile.icon;
    stateManager.dispatch('myId', this.myId);
  }

  _addNewConversation(conversation) {
    if (!conversation.isValid()) throw new Error('chat is invalid');
    else {
      this._addConversation(conversation);
      this._saveState();
      stateManager.dispatch('chats', [...this.conversations])
    }
  }

  _addConversation(conversation) {
    conversation.on('new-message-notification', this._handleNewMessage.bind(this));
    conversation.on('metadata-updated', this._handleChatUpdated.bind(this));
    conversation.on('unread-change', this._handleUnreadChange.bind(this));
    conversation.on('terminated', this._handleChatTerminated.bind(this));
    this.conversations.push(conversation);
  }

  _removeChat(conversation) {
    console.trace('removing chat', conversation.id);
    if (!this.conversations.includes(conversation)) return Promise.reject(new Error('no such chat'));
    this.conversations = this.conversations.filter(c => c !== conversation);
    this._saveState();
    stateManager.dispatch('chats', this.conversations)
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

  _handleChatUpdated() {
    this._saveState();
    stateManager.dispatch('chats', this.conversations);
  }

  _handleChatTerminated(conversation) {
    this.conversations = this.conversations.filter(c => c !== conversation);
    this._saveState();
    localStorage.deleteMessagesByConversation(conversation.id);
    stateManager.dispatch('chats', this.conversations);
  }

  _loadState() {
    const json = localStorage.read(this.id);
    if (!json) {
      return Promise.resolve(false);
    }
    else {
      const state = JSON.parse(json);
      if (state.sessionKey) {
        this.sessionKey = new ecdsa.Key(state.sessionKey);
        this.myId = new User({account: this.id, delegate: this.sessionKey.cPublicKey});
      }
      this.keyDelegation = state.keyDelegation;
      this.settings = state.settings ? {...DEFAULT_SETTINGS, ...state.settings} : DEFAULT_SETTINGS;
      this.rawConversations = state.conversations;
      return Promise.resolve(true);
    }
  }

  _initialiseConversations() {
    if (!this.rawConversations) return Promise.resolve();
    const promises = [];
    this.rawConversations.forEach(rawC => {
      console.trace('loaded chat', rawC);
      const valid = this._validateConversation(rawC);
      if (valid) {
        try {
          const conversation = ChatFactory.constructChat(rawC.chatType, new ContentId(rawC.bubbleId), rawC.metadata, this.myId, this.sessionKey, undefined, rawC.delegation, this.contacts);
          this._addConversation(conversation);
          const promise = conversation.initialise()
            .then(() => {
              if (!conversation.isValid()) console.warn('conversation', conversation.id, 'is invalid', conversation);
            })
            .catch(error => {
              console.warn('failed to initialise conversation', rawC.id, error);
          });
          promises.push(promise);
        }
        catch(error) {
          console.warn('failed to construct chat', rawC, error)
        }
      }
    })
    if (promises.length > 0) return Promise.all(promises);
    else return Promise.resolve();
  }

  _validateConversation(rawC) {
    try {
      new ContentId(rawC.bubbleId);
      if (rawC.id === '84531-0xd3b1E1954cf652D9094834E2cA19885ccDAadfF9') return false;
      return true;
    }
    catch(error) { 
      console.warn('saved chat is invalid', rawC, error.message)
      return false;
    }
  }

  _saveState() {
    console.trace('saving session state');
    const state = {
      sessionKey: this.sessionKey.privateKey,
      keyDelegation: this.keyDelegation,
      settings: this.settings,
      conversations: this.conversations.map(c => c.serialize())
    }
    localStorage.write(this.id, JSON.stringify(state));
  }

}


function getMembers(myId, metadata) {
  const members = [myId];
  let found = true;
  let index = 0;
  while(found) {
    if (metadata['member'+index]) members.push(new User(metadata['member'+index]));
    else found = false;
    index++;
  }
  if (assert.isArray(metadata.members)) members.concat(metadata.members.map(m => new User(m)));
  return members.sort().filter((m, i, members) => i===0 || m.id !== members[i-1].id);
}
