import { Bubble, assert, encryptionPolicies, toFileId } from "@bubble-protocol/client";
import { WebsocketBubbleProvider } from "@bubble-protocol/client/src/bubble-providers/WebsocketBubbleProvider";
import { ecdsa, ecies } from "@bubble-protocol/crypto";
import { DEFAULT_CONFIG } from "../config";


export class HushBubbleConnectRelay {

  constructor(deviceKey, listener) {
    this.monitoredDir = toFileId(deviceKey.address);
    this.listener = listener;
    this.bubble = new Bubble(
      DEFAULT_CONFIG.connectionRelay, 
      new WebsocketBubbleProvider(DEFAULT_CONFIG.connectionRelay.provider),
      deviceKey.signFunction,
      new encryptionPolicies.ECIESEncryptionPolicy(deviceKey.cPublicKey, deviceKey.privateKey)
    );
  }

  monitor() {
    console.trace('monitoring for new connections on HushBubble connect relay', this.monitoredDir);
    return this.bubble.provider.open()
      .then(() => this.bubble.mkdir(this.monitoredDir, {silent: true}))
      .then(() => this.bubble.subscribe(this.monitoredDir, this._handleNotification.bind(this), {list: true}))
      .then(this._handleNotification.bind(this));
  }

  notify(publicKey, invite) {
    const file = toFileId(ecdsa.publicKeyToAddress(publicKey), ecdsa.hash(invite, 'hex'));
    console.trace('inviting user through connection relay', publicKey, invite, file);
    return this.bubble.write(file, ecies.encrypt(publicKey, invite), {encrypted: false})
      .catch(error => console.warn('failed to send connect request', error));
  }

  reconnect() {
    if (this.bubble.provider.state !== 'closed') return Promise.resolve();
    return this.bubble.provider.open()
      .then(() => {
        return this.bubble.subscribe(this.monitoredDir, this._handleNotification.bind(this), {list: true});
      })
      .catch(console.warn);
  }

  close() {
    if (this.bubble.provider.state === 'closed') return Promise.resolve();
    return this.bubble.provider.close();
  }

  _handleNotification(notification) {
    console.trace('rxd connection relay notification', notification);
    if (assert.isArray(notification.data)) {
      notification.data.forEach(fileDetails => {
        if (fileDetails.event !== 'delete') {
          console.trace('new invite rxd through connection relay', fileDetails);
          this.bubble.read(fileDetails.name)
            .then(this.listener)
            .then(() => this.bubble.delete(fileDetails.name))
            .catch(console.warn);
        }
      });
    }
  }

}