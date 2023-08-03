import { bubbleManagers, encryptionPolicies } from "@bubble-protocol/client";
import { Chat } from "../Chat";

export class PrivateChat extends Chat {

  constructor(bubbleId, myId, deviceKey) {
    super(bubbleId, myId, deviceKey, new encryptionPolicies.AESGCMEncryptionPolicy(), new bubbleManagers.MultiUserEncryptedBubbleManager());
  }

}