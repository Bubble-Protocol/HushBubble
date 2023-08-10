import { DEFAULT_CONFIG } from "../config";
import { PrivateChat } from "./PrivateChat";
import { PublicChat } from "./PublicChat"

export const ChatFactory = {

  constructChat: (chatType, classType, bubbleId, myId, deviceKey, terminateKey, delegation, options={}) => {
    chatType = getChatTypeObject(chatType);
    switch (classType) {
      case undefined:
      case 'PublicChat': return new PublicChat(chatType, bubbleId, myId, deviceKey, delegation);
      case 'PrivateChat': return new PrivateChat(chatType, bubbleId, myId, deviceKey, terminateKey, options.member1 ? [options.member1] : undefined, delegation);
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