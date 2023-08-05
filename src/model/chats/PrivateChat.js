import { userManagers, encryptionPolicies } from "@bubble-protocol/client";
import { Chat } from "../Chat";

export class PrivateChat extends Chat {

  constructor(bubbleId, myId, deviceKey, otherUsers) {
    super('PrivateChat', bubbleId, myId, deviceKey, new encryptionPolicies.AESGCMEncryptionPolicy(), new userManagers.MultiUserManager(deviceKey, otherUsers));
  }

}