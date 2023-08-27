import { DEFAULT_CONFIG } from "../config";
import { OneToOneChat } from "./OneToOneChat";
import { PrivateChat } from "./PrivateChat";
import { PublicChat } from "./PublicChat"

export const ChatFactory = {

  constructChat: (chatType, bubbleId, metadata, myId, deviceKey, terminateKey, delegation, contacts, options={}) => {
    chatType = getChatTypeObject(chatType);
    switch (chatType.classType) {
      case undefined:
      case 'PublicChat': return new PublicChat(chatType, bubbleId, metadata, myId, deviceKey, delegation, contacts);
      case 'PrivateChat': return new PrivateChat(chatType, bubbleId, metadata, myId, deviceKey, terminateKey, options.member1 ? [options.member1.delegate.publicKey] : undefined, delegation, contacts);
      case 'OneToOneChat': return new OneToOneChat(chatType, bubbleId, metadata, myId, deviceKey, terminateKey, options.member1 ? [options.member1.delegate.publicKey] : undefined, delegation, contacts);
      default: throw new Error('Invalid bubble class type');
    }
  }

}


function getChatTypeObject(chatTypeId) {
  if (!chatTypeId.bytecodeHash) return DEFAULT_CONFIG.bubbles.find(b => b.id.category === 'original-hushbubble-public-chat'); // temporary to handle HushBubble Public Chat Channel
  const chatTypeObj = DEFAULT_CONFIG.bubbles.find(b => b.id.bytecodeHash === chatTypeId.bytecodeHash);
  if (!chatTypeObj) throw new Error('Invalid chat type');
  return chatTypeObj;
}