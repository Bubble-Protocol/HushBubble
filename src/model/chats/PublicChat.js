import { Chat } from "../Chat";

export class PublicChat extends Chat {

  constructor(bubbleId, myId, deviceKey) {
    super('PublicChat', bubbleId, myId, deviceKey);
  }

}