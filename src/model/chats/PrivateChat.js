import { userManagers, encryptionPolicies } from "@bubble-protocol/client";
import { Chat } from "../Chat";

export class PrivateChat extends Chat {

  constructor(chatType, bubbleId, myId, deviceKey, encryptionKey, otherUsers) {
    super(chatType, 'PrivateChat', bubbleId, myId, deviceKey, new encryptionPolicies.AESGCMEncryptionPolicy(encryptionKey), new userManagers.MultiUserManager(deviceKey, undefined, otherUsers));
  }

  getTerminateKey() {
    return '0x'+this.encryptionPolicy.privateKey.toString('hex');
  }

}