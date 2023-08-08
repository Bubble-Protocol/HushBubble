import { bubbleProviders, assert, toFileId, Bubble, ErrorCodes } from "@bubble-protocol/client";
import localStorage from "./utils/LocalStorage";
import { EventManager } from "./utils/EventManager";
import { stateManager } from "../state-context";
import { fromBase64Url, toBase64Url } from "./utils/StringUtils";

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

const STATE = {
  uninitialised: 'uninitialised',
  initialised: 'open',
  notMember: 'no longer a member',
  invalid: 'corrupted',
  terminated: 'terminated'
}

export class Chat extends Bubble {

  state = STATE.uninitialised;
  listeners = new EventManager(['new-message-notification', 'unread-change', 'terminated']);

  id;
  chatType;
  classType;
  myId;
  metadata = DEFAULT_METADATA;
  messages = [];
  lastModTime = 1;
  lastRead = 1;
  unreadMsgs = 0;
  
  constructor(chatType, classType, bubbleId, myId, deviceKey, encryptionPolicy, userManager) {
    assert.isNotNull(chatType, 'chatType');
    assert.isString(classType, 'classType');
    assert.isObject(myId, 'myId');
    assert.isObject(deviceKey, 'deviceKey');

    // construct the provider
    const provider = new bubbleProviders.WebsocketBubbleProvider(bubbleId.provider, {sendTimeout: 10000});

    // construct the bubble
    console.trace('constructing', classType, bubbleId, provider, deviceKey.signFunction, encryptionPolicy, userManager)
    super(bubbleId, provider, deviceKey.signFunction, encryptionPolicy, userManager);
    this.id = bubbleId.chain+'-'+bubbleId.contract;
    this.chatType = chatType;
    this.classType = classType;
    this.myId = myId;

    // register state variables
    stateManager.register(this.id+'-state', this.state);
    stateManager.register(this.id+'-connection-state', this.provider.state);
    stateManager.register(this.id+'-metadata', {bubbleId: bubbleId, ...DEFAULT_METADATA});
    stateManager.register(this.id+'-messages', []);
    stateManager.register(this.id+'-unread', 0);

    // setup listeners
    provider.on('event', (_, state) => stateManager.dispatch(this.id+'-connection-state', state))
    provider.on('reconnect', this._handleReconnect.bind(this));
    provider.on('error', event => console.warn(this.id, 'websocket error:', event));
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  create({metadata, options}) {
    this._validateMetadata(metadata);
    this.metadata = metadata;
    stateManager.dispatch(this.id+'-metadata', this.metadata);
    return this.provider.open()
      .then(() => super.create(options))
      .then(() => {
        return Promise.all([
          this._saveMetadata(metadata, options),
          this.mkdir(CONTENT.textChat, options),
        ])
      })
      .then(() => {
        return this._subscribeToContent(false, false, options);
      })
      .then(() => {
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
      })
  }

  postMessage(message) {
    console.trace(this.id, 'post message', message);
    if (message.id === undefined) message.id = Date.now() + Math.floor(Math.random() * Math.pow(10, 6));
    this.write(CONTENT.textChat + '/' + message.id, JSON.stringify(message))
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

  setMetadata(metadata) {
    this._validateMetadata(metadata);
    this._saveMetadata(metadata);
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
    return {chatType: this.chatType.id, classType: this.classType, id: this.id, bubbleId: this.contentId.toString(), metadata: this.metadata}
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
      t: this.classType,
      id: this.contentId.toString()
    })))
  }

  static parseInvite(invite) {
    return JSON.parse(fromBase64Url(invite));
  }

  getTerminateKey() {
    throw new Error('Chat.getTerminateKey is a virtual function and must be implemented');
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

  _saveMetadata(metadata, options) {
    return this.write(CONTENT.metadataFile, JSON.stringify(metadata), options);
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
    this.metadata = {...DEFAULT_METADATA, ...metadata, bubbleId: this.contentId};
    this.metadata.members = getMembers(metadata);
    stateManager.dispatch(this.id+'-metadata', this.metadata);
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
    message.from = new User(message.from);
    message.conversationId = this.id;
    const index = this.messages.findIndex(m => m.id === message.id);
    if (index >=0) this.messages[index] = message;
    else this.messages.push(message);
    this.messages.sort((a,b) => a.created - b.created);
    this.messages = [...this.messages];  // mutate to trigger any react hooks
    localStorage.writeMessage(message);
    stateManager.dispatch(this.id+'-messages', this.messages);
    this.listeners.notifyListeners('new-message-notification');
    this._updateUnread()
  }

  _loadMessages(conversationId) {
    return localStorage.queryMessagesByConversation(conversationId)
      .then(messages => {
        messages.sort((a,b) => a.created - b.created);
        messages.forEach(m => {m.from = new User(m.from)});
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

  _subscribeToContent(metadataRead, textChatList, options={}) {
    console.trace(this.id, 'subscribing to content');
    return Promise.all([
      this.subscribe(CONTENT.metadataFile, this._handleMetadataChange.bind(this), {...options, read: metadataRead}),
      this.subscribe(CONTENT.textChat, this._handleMessageNotification.bind(this), {...options, since: textChatList ? this.lastModTime : undefined}),
    ])
    .then(subscriptions => { 
      console.trace(this.id, 'subscriptions', subscriptions)
      if(metadataRead) this._handleMetadataChange(subscriptions[0]);
      if(textChatList) this._handleMessageNotification(subscriptions[1]);
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
    while (index >= 0 && this.messages[index].modified > this.lastRead) {
      if (this.messages[index].from.id !== this.myId.id) count++;
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
    }
    else if(error.code === ErrorCodes.BUBBLE_ERROR_PERMISSION_DENIED) {
      this._setState(STATE.notMember);
      if (this.provider.state !== 'closed') this.provider.close();
    }
  }

}

function getMembers(metadata) {
  let members = [];
  let found = true;
  let index = 0;
  while(found) {
    if (metadata['member'+index]) members.push(new User(metadata['member'+index]));
    else found = false;
    index++;
  }
  if (assert.isArray(metadata.members)) members = members.concat(metadata.members.map(m => new User(m)));
  return members.sort((a,b) => a.id === b.id ? 0 : 1).filter((m, i, members) => i===0 || m.id !== members[i-1].id);
}
