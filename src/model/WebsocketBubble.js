import { Bubble, ContentId, assert, bubbleProviders } from "@bubble-protocol/client";
import { EventManager } from "./utils/EventManager";

const BUBBLE_STATE = {
  uninitialised: 'uninitialised',
  contractDeployed: 'contract-deployed',
  initialised: 'initialised'
}

const CONNECTED_STATE = {
  closed: 'closed',
  connecting: 'connecting',
  open: 'open',
  failed: 'failed'
}

export class WebsocketBubble extends Bubble {

  state = BUBBLE_STATE.uninitialised;
  listeners = new EventManager(['state-change', 'available', 'close', 'error']);
  content = {};

  constructor(bubbleId, key, options) {
    assert.isInstanceOf(bubbleId, ContentId, 'bubbleId');
    assert.isObject(key, 'key'); console.debug('key', key.signFunction)
    super(bubbleId, new bubbleProviders.WebsocketBubbleProvider(bubbleId.provider, options), key.signFunction)
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  initialise(config) {
    this.config = config || this.config;
    return this.provider.connect()
      .then(() => {
        console.trace('reading critical content');
        return Promise.all(
          this.config.content.map(content => {
            if (content.type === 'file' && !content.noInit) {
              return this.read(content.file)
                .then(data => {
                  if (content.json) data = JSON.parse(data);
                  this.content[content.name] = data
                })
            }
          }).filter(Boolean)
        )
      })
      .then(() => {
        return this._subscribeToContent();
      })
      .then(() => {
        console.trace('bubble initialised');
        this.state = BUBBLE_STATE.initialised;
        this.listeners.notifyListeners('state-change', this.getConnectionState());
      })
  }

  getConnectionState() {
    if (this.state !== BUBBLE_STATE.initialised) return CONNECTED_STATE.closed;
    else {
      switch(this.provider.state) {
        case 'open': return CONNECTED_STATE.open;
        case 'reconnecting': return CONNECTED_STATE.connecting; 
        default: return CONNECTED_STATE.failed;
      }
    }
  }

  close() {
    return this.provider.close();
  }

  _handleConnectionChange(avail, reason) {
    if (this.state === BUBBLE_STATE.initialised) {
      if (avail) this._handleReconnect();
      else {
        this.listeners.notifyListeners('state-change', this.getConnectionState(), reason);
        this.listeners.notifyListeners('available', false, reason);
      }
    }
  }

  _handleReconnect() {
    this.subscriptions = [];
    this._subscribeToContent()
      .then(() => {
        this.listeners.notifyListeners('state-change', this.getConnectionState());
        this.listeners.notifyListeners('available', true)
      })
      .catch(error => {
        console.warn('bubble failed to resubscribe after reconnection', error);
        this.provider.close();
      });
  }

  _subscribeToContent(respond=true) {
    console.trace('subscribing to content', this.config.subscriptions);
    return Promise.all(this.config.subscriptions.map(sub => { console.debug(sub);
      const since = sub.since !== null ? (assert.isFunction(sub.since) ? sub.since() : sub.since) : undefined;
      return this.subscribe(sub.file, sub.onNotify, {read: !!sub.onRead, list: !since && !!sub.onList, since: since})
    }))
    .then(subscriptions => { console.debug('subscriptions', subscriptions)
      if (respond) {
        this.config.subscriptions.forEach((sub, index) => {
          const data = subscriptions[index].data;
          if (!!sub.onRead && !!data) sub.onRead(subscriptions[index]);
          if (!!sub.onList && !!data) sub.onList(subscriptions[index]);
        } );
      }
    })
  }

  _setupWebsocketListeners() {
    this.provider.on('available', this._handleConnectionChange.bind(this));
    this.provider.on('error', event => this.listeners.notifyListeners('error', event));
  }

}

