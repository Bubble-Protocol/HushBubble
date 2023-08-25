import { stateManager } from "../../state-context";
import { PrivateChat } from "./PrivateChat";

export class OneToOneChat extends PrivateChat {

  create(params) {
    return super.create(params)
      .then(result => {
        this.contacts.getContact(params.metadata.member1.id, this._handleContactUpdate);
        return result;
      })
  }

  _handleContactUpdate(user) {
    const knownAs = user.getKnownAs();
    if (user.account !== this.myId.account && (knownAs !== this.metadata.title || user.icon !== this.metadata.icon)) {
      this.metadata.title = user.getKnownAs();
      this.metadata.icon = user.icon;
      stateManager.dispatch(this.id+'-metadata', this.metadata);
      this.listeners.notifyListeners('metadata-updated', this.metadata);
    }
    super._handleContactUpdate(user);
  }

  getChatInfo() {
    return "One-To-One Chat";
  }

}