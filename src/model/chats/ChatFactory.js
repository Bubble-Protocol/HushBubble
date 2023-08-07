import { assert } from "@bubble-protocol/core";
import { PrivateChat } from "./PrivateChat";
import { PublicChat } from "./PublicChat"
import { ecdsa } from "@bubble-protocol/crypto";

export const ChatFactory = {

  constructChat: (chatType, classType, bubbleId, myId, deviceKey, terminateKey, options={}) => {
    switch (classType) {
      case undefined:
      case 'PublicChat': return new PublicChat(chatType, bubbleId, myId, deviceKey);
      case 'PrivateChat': return new PrivateChat(chatType, bubbleId, myId, deviceKey, terminateKey, options.member1 ? [options.member1] : undefined);
      default: throw new Error('Invalid bubble class type');
    }
  },

  getConstructorParams(params, metadata, terminateKey) {
    if (!params) return [];
    if (assert.isString(params)) return getParam(params, metadata, terminateKey);
    else if (assert.isArray(params)) {
      console.debug(params, params.map(p => getParam(p, metadata, terminateKey)))
      return params.map(p => getParam(p, metadata, terminateKey));
    }
    else throw new Error('Type Error: Invalid params type, expecting array or string');
  }
  
}


function getParam(param, metadata, terminateKey) {
  console.debug(param, metadata)
  switch(param) {
    case 'member0': return metadata.member0 ? metadata.member0.address : metadata.members[0].address;
    case 'member1': return metadata.member1 ? metadata.member1.address : metadata.members[1].address;
    case 'members': return metadata.members.map(m => m.address);
    case 'terminateToken': return '0x'+ecdsa.hash(terminateKey, 'hex');
    default: throw new Error('Invalid constructor parameter type '+param)
  }
}
