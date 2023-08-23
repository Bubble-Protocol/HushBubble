import { userManagers, encryptionPolicies } from "@bubble-protocol/client";
import { Chat } from "../Chat";

export class PrivateChat extends Chat {

  constructor(chatType, bubbleId, myId, sessionKey, encryptionKey, otherUsers, delegation) {
    super(chatType, 'PrivateChat', bubbleId, myId, sessionKey, new encryptionPolicies.AESGCMEncryptionPolicy(encryptionKey), new userManagers.MultiUserManager(sessionKey, undefined, otherUsers), delegation);
  }

  getTerminateKey() {
    return '0x'+this.encryptionPolicy.privateKey.toString('hex');
  }

}