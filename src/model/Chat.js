import { bubbleProviders, assert, toFileId, Bubble, ErrorCodes } from "@bubble-protocol/client";
import localStorage from "./utils/LocalStorage";
import { EventManager } from "./utils/EventManager";
import { stateManager } from "../state-context";
import { fromBase64Url, toBase64Url } from "./utils/StringUtils";
import { toDelegateSignFunction } from "@bubble-protocol/client";

import { User } from "./User";

const CONTENT = {
  metadataFile: toFileId(101),
  textChat: toFileId(1),
}

const DEFAULT_METADATA = {
  title: undefined,
  icon: undefined,
  members: []
}

const DEFAULT_CAPABILITIES = {
  canConstruct: true,
  canDelete: true,
  canLeave: true,
  canWrite: true,
  canManageMembers: false
}

const STATE = {
  uninitialised: 'uninitialised',
  initialised: 'open',
  notMember: 'no longer a member',
  invalid: 'corrupted',
  terminated: 'terminated'
}

export class Chat extends Bubble {

  state = STATE.uninitialised;
  listeners = new EventManager(['new-message-notification', 'metadata-updated', 'unread-change', 'terminated']);

  id;
  chatType;
  myId;
  metadata;
  messages = [];
  lastModTime = 1;
  lastRead = 1;
  unreadMsgs = 0;
  
  constructor(chatType, bubbleId, metadata=DEFAULT_METADATA, myId, deviceKey, encryptionPolicy, userManager, delegation, contacts) {
    assert.isNotNull(chatType, 'chatType');
    assert.isObject(metadata, 'metadata');
    assert.isInstanceOf(myId, User, 'myId');
    assert.isObject(deviceKey, 'deviceKey');
    assert.isObject(contacts, 'contacts');

    // handle any delegation
    if (delegation) {
      deviceKey = {...deviceKey, signFunction: toDelegateSignFunction(deviceKey.signFunction, delegation)};
    }

    // construct the provider
    const provider = new bubbleProviders.WebsocketBubbleProvider(bubbleId.provider, {sendTimeout: 10000});

    // construct the bubble
    console.trace('constructing', chatType.classType, bubbleId, chatType, myId, provider, deviceKey.signFunction, encryptionPolicy, userManager)
    super(bubbleId, provider, deviceKey.signFunction, encryptionPolicy, userManager);

    // set class variables
    this.id = bubbleId.chain+'-'+bubbleId.contract;
    this.chatType = chatType;
    this.metadata = metadata;
    this.myId = myId;
    this.delegation = delegation;
    this.contacts = contacts;

    this.capabilities = {
      ...DEFAULT_CAPABILITIES,
      ...chatType.actions,
      canManageMembers: chatType.actions.addMembers !== undefined
    };

    // register state variables
    stateManager.register(this.id+'-state', this.state);
    stateManager.register(this.id+'-connection-state', this.provider.state);
    stateManager.register(this.id+'-metadata', this.metadata);
    stateManager.register(this.id+'-messages', []);
    stateManager.register(this.id+'-unread', 0);
    stateManager.register(this.id+'-capabilities', this.capabilities);

    // setup listeners
    provider.on('event', (_, state) => stateManager.dispatch(this.id+'-connection-state', state))
    provider.on('reconnect', this._handleReconnect.bind(this));
    provider.on('error', event => console.warn(this.id, 'websocket error:', event));
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
    this._handleContactUpdate = this._handleContactUpdate.bind(this);
  }

  create({metadata, options}) {
    this._validateMetadata(metadata);
    this.metadata = metadata;
    this.metadata.members = this._getMembers(metadata);
    return this.provider.open()
      .then(() => super.create(options))
      .then(() => {
        return Promise.all([
          this._saveMetadata(options),
          this.mkdir(CONTENT.textChat, options),
        ])
      })
      .then(() => {
        return this._subscribeToContent(false, false, options);
      })
      .then(() => {
        stateManager.dispatch(this.id+'-metadata', this.metadata);
        this._setState(STATE.initialised);
        return this.contentId;
      })
  }

  initialise(options) {
    return this._loadMessages(this.id)
      .then(() => {
        this.provider.open()
          .then(() => super.initialise(options))
          .then(() => {
            return this._subscribeToContent(true, true, options);
          })
          .then(() => {
            this._setState(STATE.initialised);
            stateManager.dispatch(this.id+'-connection-state', this.provider.state); // belt and braces
          })
          .catch(error => {
            this._handleError(error);
          })
        });
  }

  reconnect() {
    if (this.state !== STATE.initialised) return Promise.resolve();
    if (this.provider.state !== 'closed') return Promise.resolve();
    return this.provider.open()
      .then(() => {
        return this._subscribeToContent(true, true);
      })
      .catch(error => {
        this._handleError(error);
      })
  }

  join(options) {
    console.trace('joining conversation bubble', this.contentId);
    return this.provider.open()
      .then(() => super.initialise(options))
      .then(() => {
        return this._subscribeToContent(true, true, options);
      })
      .then(() => {
        this._setState(STATE.initialised);
        return this.metadata;
      })
      .catch(error => {
        this._handleError(error);
        throw error;
      })
  }

  postMessage(message) {
    message.from = this.myId.getId();
    const isNew = message.id === undefined;
    if (isNew) message.id = Date.now() + Math.floor(Math.random() * Math.pow(10, 6));
    const method = isNew ? this.append.bind(this) : this.write.bind(this);
    method(CONTENT.textChat + '/' + message.id, JSON.stringify(message))
      .then(() => {
        message.created = Date.now();
        message.modified = message.created;
        this._setMessage(message);
      })
      .catch(error => {
        console.warn(this.id, 'failed to post message');
        this._handleError(error);
      })
    message.pending = true;
    message.created = Date.now();
    message.modified = message.created;
    this._setMessage(message);
    return Promise.resolve();
  }

  async setMetadata(metadata) {
    const newMetadata = {...this.metadata, ...metadata};
    try {
      this._validateMetadata(newMetadata);
      this.metadata = newMetadata;
      return this._saveMetadata(newMetadata);
    }
    catch(error) {
      return Promise.reject(error);
    }
  }

  setReadTime(time) {
    if (this.unreadMsgs > 0 && time > this.lastRead) {
      this.lastRead = time;
      this._updateUnread();
    }
  }

  getMessages() {
    return this.messages || [];
  }

  serialize() {
    const plainMetadata = this._getPlainMetadata({includeMemberDetails: true});
    return {chatType: this.chatType.id, id: this.id, bubbleId: this.contentId.toString(), metadata: plainMetadata, delegation: this.delegation}
  }

  deserialize(data) {
    assert.isObject(data, 'data');
    assert.isString(data.id, 'data');
    assert.isString(data.bubbleId, 'data');
    if (data.id !== this.id) throw new Error('wrong id in serialized data');
    if (data.bubbleId !== this.bubbleId.toString()) throw new Error('wrong bubbleId in serialized data');
    this._validateMetadata(data.metadata);
    this.metadata = data.metadata;
  }

  isValid() {
    return this.state !== STATE.invalid;
  }

  getInvite() {
    return toBase64Url(Buffer.from(JSON.stringify({
      f: this.myId.account,
      t: this.chatType.id.bytecodeHash.slice(0,16), // first 8 bytes of bytecode
      id: this.contentId.toString()
    })))
  }

  static parseInvite(invite) {
    return JSON.parse(fromBase64Url(invite));
  }

  getTerminateKey() {
    throw new Error('Chat.getTerminateKey is a virtual function and must be implemented');
  }

  getChatInfo() {
    return this.metadata.members.length + ' member' + (this.metadata.members.length === 1 ? '' : 's');
  }

  close() {
    if (this.provider.state === 'closed') return Promise.resolve();
    return this.provider.close();
  }

  _setState(state) {
    this.state = state;
    stateManager.dispatch(this.id+'-state', state);
  }

  _validateMetadata(metadata) {
    assert.isObject(metadata, 'metadata');
    if (metadata.title) assert.isString(metadata.title, 'title');
    if (metadata.members) assert.isArray(metadata.members, 'members');
  }

  _saveMetadata(options) {
    const plainMetadata = this._getPlainMetadata({includeMemberDetails: false});
    return this.write(CONTENT.metadataFile, JSON.stringify(plainMetadata), options);
  }

  _getPlainMetadata(options) {
    return {
      ...this.metadata,
      members: this.metadata.members.map(m => {
        if (options.includeMemberDetails) return {id: m.id, icon: m.icon, title: m.title}
        else return {id: m.id};
      })
    }
  }

  _handleMessageNotification(notification) {
    console.trace(this.id, 'msg rxd', notification);
    if (assert.isArray(notification.data)) {
      notification.data.forEach(msg => this._readMessage(msg));
    }
  }

  _handleMetadataChange(notification) { 
    console.trace(this.id, 'rxd new metadata', notification)
    const metadata = JSON.parse(notification.data);
    this.metadata = {...DEFAULT_METADATA, ...this.metadata, ...metadata};
    this.metadata.members = this._getMembers(metadata);
    stateManager.dispatch(this.id+'-metadata', this.metadata);
    this.listeners.notifyListeners('metadata-updated', this.metadata);
  }

  _readMessage(messageDetails, attempts=5) {
    return this.read(messageDetails.name)
      .then(messageJson => {
        try {
          console.trace(this.id, 'message', messageJson);
          const message = JSON.parse(messageJson);
          message.created = messageDetails.created;
          message.modified = messageDetails.modified;
          if (assert.isString(message.from)) this._setMessage(message);
          else console.warn('invalid message rxd', message);
        }
        catch(error) {
          console.warn(this.id, 'message parse error', error);
        }
      })
      .catch(error => {
        console.warn(this.id, 'message read error', error.code, error.message);
        if (error.code === -32005) { 
          // bubble server internal error.  Try again in 1s.
          if (attempts <= 1) console.warn(this.id, 'abandoning message read after 5 failed attempts');
          else {
            console.trace(this.id, 'trying again in 1s')
            setTimeout(() => this._readMessage(messageDetails, --attempts), 1000);
          }
        }
        else{
          this._handleError(error);
        }
      })
  }

  _setMessage(message) {
    message.from = this.contacts.getContact(message.from, this._handleContactUpdate);
    message.conversationId = this.id;
    const index = this.messages.findIndex(m => m.id === message.id);
    if (index >=0) this.messages[index] = message;
    else this.messages.push(message);
    this.messages.sort((a,b) => a.created - b.created);
    this.messages = [...this.messages];  // mutate to trigger any react hooks
    localStorage.writeMessage({...message, from: message.from.id});
    stateManager.dispatch(this.id+'-messages', this.messages);
    this.listeners.notifyListeners('new-message-notification');
    this._updateUnread()
  }

  _loadMessages(conversationId) {
    return localStorage.queryMessagesByConversation(conversationId)
      .then(messages => {
        messages.sort((a,b) => a.created - b.created);
        messages.forEach(m => {m.from = this.contacts.getContact(m.from, this._handleContactUpdate)});
        this.messages = messages;
        this.lastModTime = messages.reduce((time, m) => {return m.modified > time ? m.modified : time}, 1);
        this.lastRead = this.lastModTime;
        stateManager.dispatch(this.id+'-messages', this.messages);
      })
  }

  _handleReconnect() {
    this._subscribeToContent(true, true)
      .then(() => {
        this.listeners.notifyListeners('state-change', this.getConnectionState());
        this.listeners.notifyListeners('available', true)
      })
      .catch(error => {
        console.warn('bubble failed to resubscribe after reconnection');
        this._handleError(error);
        if (this.provider.state !== 'closed') this.provider.close();
      });
  }

  _subscribeToContent(metadataRead, textChatList, options={}, promises=[]) {
    console.trace(this.id, 'subscribing to content');
    return Promise.all(promises.concat([
      this.subscribe(CONTENT.metadataFile, this._handleMetadataChange.bind(this), {...options, read: metadataRead}),
      this.subscribe(CONTENT.textChat, this._handleMessageNotification.bind(this), {...options, since: textChatList ? this.lastModTime : undefined}),
    ]))
    .then(subscriptions => { 
      console.trace(this.id, 'subscriptions', subscriptions)
      if(metadataRead) this._handleMetadataChange(subscriptions[0]);
      if(textChatList) this._handleMessageNotification(subscriptions[1]);
      return subscriptions;
    })
  }

  _updateUnread() {
    this.unreadMsgs = this._countUnreadMsgs();
    stateManager.dispatch(this.id+'-unread', this.unreadMsgs);
    this.listeners.notifyListeners('unread-change');
  }

  _countUnreadMsgs() {
    let count = 0;
    let index = this.messages.length-1;
    const myId = this.myId.getId();
    while (index >= 0 && this.messages[index].modified > this.lastRead) {
      if (this.messages[index].from.id !== myId) count++;
      index--;
    }
    return count;  
  }

  _handleError(error) {
    console.warn(this.id, error);
    if (error.code === ErrorCodes.BUBBLE_ERROR_BUBBLE_TERMINATED) {
      this._setState(STATE.terminated);
      if (this.provider.state !== 'closed') this.provider.close();
      this.listeners.notifyListeners('terminated', this);
      this.contacts.removeUpdateListener(this._handleContactUpdate);
    }
    else if(error.code === ErrorCodes.BUBBLE_ERROR_PERMISSION_DENIED) {
      this._setState(STATE.notMember);
      if (this.provider.state !== 'closed') this.provider.close();
    }
  }

  _handleContactUpdate() {
    stateManager.dispatch(this.id+'-metadata', this.metadata);
    this.listeners.notifyListeners('metadata-updated', this.metadata);
    stateManager.dispatch(this.id+'-messages', this.messages);
  }

  _getMembers(metadata) {
    let members = [];
    let found = true;
    let index = 0;
    while(found) {
      if (metadata['member'+index]) members.push(metadata['member'+index]);
      else found = false;
      index++;
    }
    if (assert.isArray(metadata.members)) members = members.concat(metadata.members);
    members = members.map(m => this.contacts.getContact(m, this._handleContactUpdate));
    return members.sort((a,b) => a.id.localeCompare(b.id)).filter((m, i, members) => i===0 || m.id !== members[i-1].id);
  }
  
}
