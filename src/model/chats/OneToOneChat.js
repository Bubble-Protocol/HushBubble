import { stateManager } from "../../state-context";
import { PrivateChat } from "./PrivateChat";

export class OneToOneChat extends PrivateChat {

  create(...params) {
    return super.create(...params)
      .then(result => {
        this.metadata.members.forEach(m => this._setTitleFromUser(m));
        return result;
      })
  }

  initialise(...params) {
    return super.initialise(...params)
      .then(result => {
        this.metadata.members.forEach(m => this._setTitleFromUser(m));
        return result;
      })
  }

  _handleContactUpdate(user) {
    this._setTitleFromUser(user);
    super._handleContactUpdate(user);
  }

  _setTitleFromUser(user) {
    const knownAs = user.getKnownAs();
    if (user.account !== this.myId.account && (knownAs !== this.metadata.title || user.icon !== this.metadata.icon)) {
      this.metadata.title = user.getKnownAs();
      this.metadata.icon = user.icon;
      stateManager.dispatch(this.id+'-metadata', this.metadata);
      this.listeners.notifyListeners('metadata-updated', this.metadata);
    }
  }

  getChatInfo() {
    return "One-To-One Chat";
  }

}