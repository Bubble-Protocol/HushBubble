import { encryptionPolicies } from "@bubble-protocol/client";
import { Chat } from "../Chat";

export class PublicChat extends Chat {

  constructor(bubbleId, myId, deviceKey) {
    super(bubbleId, myId, deviceKey, new encryptionPolicies.NullEncryptionPolicy());
  }

}