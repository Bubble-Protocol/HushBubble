import { userManagers, encryptionPolicies } from "@bubble-protocol/client";
import { Chat } from "../Chat";

export class PrivateChat extends Chat {

  constructor(chatType, bubbleId, metadata, myId, sessionKey, encryptionKey, otherUsers, delegation, contacts) {
    super(chatType, bubbleId, metadata, myId, sessionKey, new encryptionPolicies.AESGCMEncryptionPolicy(encryptionKey), new userManagers.MultiUserManager(sessionKey, undefined, otherUsers), delegation, contacts);
  }

  getTerminateKey() {
    return '0x'+this.encryptionPolicy.privateKey.toString('hex');
  }

}