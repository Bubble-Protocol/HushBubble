import { assert, toDelegateSignFunction, toFileId } from "@bubble-protocol/client";
import { WebsocketBubble } from "./WebsocketBubble";
import { User } from "./User";
import localStorage from "./utils/LocalStorage";
import { stateManager } from "../state-context";

const CONTENT = {
  metadataFile: toFileId(101),
  textChat: toFileId(1),
}

const DEFAULT_METADATA = {
  title: undefined,
  icon: undefined,
  members: []
}

export class ConversationBubble extends WebsocketBubble {

  user;
  messages = [];
  lastModTime = 0;

  config = {
    title: 'Conversation',
    content: [
      {name: 'appMetadata', type: 'file', file: CONTENT.metadataFile, json: true, noInit: true},
      {name: 'textChat', type: 'dir', file: CONTENT.textChat, noInit: true}
    ],
    subscriptions: [
      {file: CONTENT.metadataFile, onNotify: this._handleMetadataChange.bind(this), onRead: this._handleMetadataChange.bind(this)},
      {file: CONTENT.textChat, onNotify: this._handleMessageNotification.bind(this), onRead: this._handleMessageNotification.bind(this), since: () => this.lastModTime}
    ]
  }

  constructor(bubbleId, deviceKey, delegation) {
    const user = !delegation ? deviceKey : {
      ...deviceKey,
      delegation,
      signFunction: toDelegateSignFunction(deviceKey.signFunction, delegation)
    }
    super(bubbleId, user);
    this.id = bubbleId.chain+'-'+bubbleId.contract;
    stateManager.register(this.id+'-connection-state', this.getConnectionState());
    stateManager.register(this.id+'-metadata', {});
    stateManager.register(this.id+'-messages', []);
    this.listeners.on('state-change', state => stateManager.dispatch(this.id+'-connection-state', state))
  }

  create(metadata) {
    this.config.content[0].initialValue = JSON.stringify(metadata);
    function addUsers() {
      console.trace('adding users');
      return Promise.all(metadata.members.map(member => this.addUser(member.address, member.publicKey)));
    }
    return super.create(metadata, {preInitHook: addUsers.bind(this)});
  }

  initialise(conversationId) {
    return this._loadMessages(conversationId)
      .then(super.initialise.bind(this))
      .then(() => {
        return this.metadata;
      })
  }

  join(deviceKey) {
    console.trace('joining conversation bubble');
    return this.provider.connect()
      .then(() => {
        return super.recoverMetadata();
      })
      .then(() => {
        return this.addUser(deviceKey.address, deviceKey.cPublicKey);
      });
  }

  postMessage(message) {
    console.trace('post message', message);
    if (message.id === undefined) message.id = Date.now() + Math.floor(Math.random() * Math.pow(10, 6));
    this.write(CONTENT.textChat + '/' + message.id, JSON.stringify(message))
      .then(() => {
        message.created = Date.now();
        message.modified = message.created;
        this._setMessage(message);
      })
    message.pending = true;
    message.created = Date.now();
    this._setMessage(message);
    return Promise.resolve();
  }

  getMessages() {
    return this.messages;
  }

  setMetadata(metadata) {
    return this.write(CONTENT.metadataFile, JSON.stringify(metadata));
  }

  _handleMessageNotification(notification) {
    console.trace('msg rxd', notification);
    if (assert.isArray(notification.data)) {
      notification.data.forEach(msg => this._readMessage(msg));
    }
  }

  _handleMetadataChange(notification) { 
    const metadata = JSON.parse(notification.data);
    console.debug('new metadata', metadata)
    this.metadata = {...DEFAULT_METADATA, ...metadata};
    stateManager.dispatch(this.id+'-metadata', this.metadata);
  }

  _readMessage(messageDetails) {
    console.trace('reading message', messageDetails);
    return this.read(messageDetails.name)
      .then(messageJson => {
        try { console.debug('_readMessage', messageJson);
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
  }

  _setMessage(message) {
    message.from = new User(message.from)
    const index = this.messages.findIndex(m => m.id === message.id);
    if (index >=0) this.messages[index] = message;
    else this.messages.push(message);
    this.messages.sort((a,b) => a.created - b.created);
    this.messages = [...this.messages];  // mutate to trigger any react hooks
    localStorage.writeMessage(message);
    stateManager.dispatch(this.id+'-messages', this.messages);
  }

  _loadMessages(conversationId) {
    return localStorage.queryMessagesByConversation(conversationId)
      .then(messages => { console.debug('loaded messages', messages);
        messages.sort((a,b) => a.created - b.created);
        messages.forEach(m => {m.from = new User(m.from)});
        this.messages = messages;
        this.lastModTime = messages.reduce((time, m) => {return m.modified > time ? m.modified : time}, 0);
        stateManager.dispatch(this.id+'-messages', this.messages);
      })
  }


}
