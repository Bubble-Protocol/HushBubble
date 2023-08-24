import { UserManager } from "@bubble-protocol/client/src/UserManager.js";
import { Chat } from "../Chat";

export class PublicChat extends Chat {

  constructor(chatType, bubbleId, metadata, myId, sessionKey, delegation, contacts) {
    super(chatType, bubbleId, metadata, myId, sessionKey, undefined, new NullUserManager(), delegation, contacts);
  }

  getTerminateKey() {
    return "0x00";
  }

  getChatInfo() {
    return "Public Chat";
  }

}


class NullUserManager extends UserManager {

  addUser(){}

  removeUser(){}

}