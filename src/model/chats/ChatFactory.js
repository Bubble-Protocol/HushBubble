import { assert } from "@bubble-protocol/core";
import { PrivateChat } from "./PrivateChat";
import { PublicChat } from "./PublicChat"
import { ecdsa } from "@bubble-protocol/crypto";
import { DEFAULT_CONFIG } from "../config";

export const ChatFactory = {

  constructChat: (chatType, classType, bubbleId, myId, deviceKey, terminateKey, options={}) => {
    chatType = getChatTypeObject(chatType);
    switch (classType) {
      case undefined:
      case 'PublicChat': return new PublicChat(chatType, bubbleId, myId, deviceKey);
      case 'PrivateChat': return new PrivateChat(chatType, bubbleId, myId, deviceKey, terminateKey, options.member1 ? [options.member1] : undefined);
      default: throw new Error('Invalid bubble class type');
    }
  },

  getParamsAsArray(params, paramValues) {
    if (!params) return [];
    if (assert.isString(params)) return getParam(params, paramValues);
    else if (assert.isArray(params)) {
      return params.map(p => getParam(p, paramValues));
    }
    else throw new Error('Type Error: Invalid params type, expecting array or string');
  },
  
  getParams(params, paramValues) {
    if (!params) return {};
    let result = {}
    if (assert.isString(params)) result[params] = getParam(params, paramValues);
    else if (assert.isObject(params)) {
      Object.keys(params).forEach(p => result[p] = getParam(params[p], paramValues));
    }
    else throw new Error('Type Error: Invalid params type, expecting array or string');
    return result;
  }
  
}


function getParam(param, metadata) {
  switch(param) {
    case 'true': return true;
    case 'false': return false;
    case 'member0': return metadata.member0 || metadata.members[0];
    case 'member0.address': return metadata.member0 ? metadata.member0.address : metadata.members[0].address;
    case 'member0.publicKey': return metadata.member0 ? metadata.member0.publicKey : metadata.members[0].publicKey;
    case 'member0.id': return metadata.member0 ? metadata.member0.id : metadata.members[0].id;
    case 'member1': return metadata.member1 || metadata.members[1];
    case 'member1.address': return metadata.member1 ? metadata.member1.address : metadata.members[1].address;
    case 'member1.publicKey': return metadata.member1 ? metadata.member1.publicKey : metadata.members[1].publicKey;
    case 'member1.id': return metadata.member1 ? metadata.member1.id : metadata.members[1].id;
    case 'members': return metadata.members;
    case 'members.address': return metadata.members.map(m => m.address);
    case 'members.publicKey': return metadata.members.map(m => m.publicKey);
    case 'members.id': return metadata.members.map(m => m.id);
    case 'title': 
      assert.isString(metadata.title, 'title');
      return metadata.title
    case 'icon': 
      assert.isString(metadata.icon, 'icon');
      return metadata.icon
    case 'terminateToken': 
      assert.isHex32(metadata.terminateKey, 'terminateKey');
      return '0x'+ecdsa.hash(metadata.terminateKey, 'hex');
    default: throw new Error('Invalid constructor parameter type '+param)
  }
}

function getChatTypeObject(chatTypeId) {
  if (!chatTypeId.bytecodeHash) return DEFAULT_CONFIG.bubbles.find(b => b.id.category === 'public'); // temporary to handle HushBubble Public Chat Channel
  const chatTypeObj = DEFAULT_CONFIG.bubbles.find(b => b.id.bytecodeHash === chatTypeId.bytecodeHash);
  if (!chatTypeObj) throw new Error('Invalid chat type');
  return chatTypeObj;
}