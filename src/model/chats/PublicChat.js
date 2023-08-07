import { Chat } from "../Chat";

export class PublicChat extends Chat {

  constructor(chatType, bubbleId, myId, deviceKey) {
    super(chatType, 'PublicChat', bubbleId, myId, deviceKey);
  }

  getTerminateKey() {
    return "0x00";
  }

}