import { UserManager } from "@bubble-protocol/client/src/UserManager.js";
import { Chat } from "../Chat";

export class PublicChat extends Chat {

  constructor(chatType, bubbleId, myId, deviceKey) {
    super(chatType, 'PublicChat', bubbleId, myId, deviceKey, undefined, new NullUserManager());
  }

  getTerminateKey() {
    return "0x00";
  }

}


class NullUserManager extends UserManager {

  addUser(){}

  removeUser(){}

}