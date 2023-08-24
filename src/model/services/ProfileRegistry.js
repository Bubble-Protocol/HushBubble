import { Bubble, toFileId } from "@bubble-protocol/client";
import { WebsocketBubbleProvider } from "@bubble-protocol/client/src/bubble-providers/WebsocketBubbleProvider";
import { DEFAULT_CONFIG } from "../config";

export class ProfileRegistry {

  constructor(account, signFunction, updateListener) {
    this.profileFile = toFileId(account);
    this.updateListener = updateListener;
    this.bubble = new Bubble(
      DEFAULT_CONFIG.profileRegistry, 
      new WebsocketBubbleProvider(DEFAULT_CONFIG.profileRegistry.provider),
      signFunction
    );
    this._parseProfile = this._parseProfile.bind(this);
    this._handleProfileUpdate = this._handleProfileUpdate.bind(this);
  }

  async initialise() {
    return this.bubble.provider.open()
    .then(() => this.bubble.subscribe(this.profileFile, this._handleProfileUpdate, {read: true}))
    .then(this._handleProfileUpdate)
  }

  async setMyProfile(profile) {
    console.trace('writing profile to', this.profileFile, profile);
    return this.bubble.write(this.profileFile, JSON.stringify(profile));
  }

  async getProfile(account) {
    const file = toFileId(account);
    console.trace('reading profile from', file);
    return this.bubble.read(file)
    .then(this._parseProfile)
  }

  async reconnect() {
    if (this.bubble.provider.state !== 'closed') return Promise.resolve();
    return this.bubble.provider.open()
      .then(() => {
        return this.bubble.subscribe(this.profileFile, this._handleProfileUpdate, {read: true})
      })
      .catch(console.warn);
  }

  async close() {
    if (this.bubble.provider.state === 'closed') return Promise.resolve();
    return this.bubble.provider.close();
  }

  _parseProfile(json) {
    try {
      return JSON.parse(json);
    }
    catch(error) {
      console.warn('failed to parse profile data', error);
      return undefined;
    }
  }

  _handleProfileUpdate(notification) {
    console.trace('rxd profile update notification', notification);
    if (notification.data) {
      const profile = this._parseProfile(notification.data);
      if (profile !== undefined) this.updateListener(profile);
    }
  }

}