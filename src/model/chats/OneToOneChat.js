import { stateManager } from "../../state-context";
import { PrivateChat } from "./PrivateChat";

export class OneToOneChat extends PrivateChat {

  _handleContactUpdate(user) {
    const knownAs = user.getKnownAs();
    if (user.id !== this.myId.id && (knownAs !== this.metadata.title || user.icon !== this.metadata.icon)) {
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