import { UserManager } from "@bubble-protocol/client/src/UserManager.js";
import { Chat } from "../Chat";

export class PublicChat extends Chat {

  constructor(chatType, bubbleId, myId, deviceKey, delegation) {
    super(chatType, 'PublicChat', bubbleId, myId, deviceKey, undefined, new NullUserManager(), delegation);
  }

  getTerminateKey() {
    return "0x00";
  }

}


class NullUserManager extends UserManager {

  addUser(){}

  removeUser(){}

}