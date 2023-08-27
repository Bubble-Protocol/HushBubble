import { assert } from "@bubble-protocol/core";
import { ecdsa } from "@bubble-protocol/crypto";
import Web3 from "web3";

export const ParamFactory = {

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


function getParam(param, paramValues) {
  switch(param) {
    case 'true': return true;
    case 'false': return false;
    case 'member0': return paramValues.member0 || paramValues.members[0];
    case 'member0.account': return paramValues.member0 ? paramValues.member0.account : paramValues.members[0].account;
    case 'member0.delegate.address': return paramValues.member0 ? paramValues.member0.delegate.address : paramValues.members[0].delegate.address;
    case 'member0.delegate.publicKey': return paramValues.member0 ? paramValues.member0.delegate.publicKey : paramValues.members[0].delegate.publicKey;
    case 'member0.id': return paramValues.member0 ? paramValues.member0.id : paramValues.members[0].id;
    case 'member1': return paramValues.member1 || paramValues.members[1];
    case 'member1.account': return paramValues.member1 ? paramValues.member1.account : paramValues.members[1].account;
    case 'member1.delegate.address': return paramValues.member1 ? paramValues.member1.delegate.address : paramValues.members[1].delegate.address;
    case 'member1.delegate.publicKey': return paramValues.member1 ? paramValues.member1.delegate.publicKey : paramValues.members[1].delegate.publicKey;
    case 'member1.id': return paramValues.member1 ? paramValues.member1.id : paramValues.members[1].id;
    case 'members.account': return paramValues.members.map(m => m.account);
    case 'members.delegate.address': return paramValues.members.map(m => m.delegate.address);
    case 'members.delegate.publicKey': return paramValues.members.map(m => m.delegate.publicKey);
    case 'members.id': return paramValues.members.map(m => m.id);
    case 'my.account': return paramValues.myId ? paramValues.myId.account : 'hidden';
    case 'my.checksum-account': return paramValues.myId ? Web3.utils.toChecksumAddress(paramValues.myId.account) : 'hidden';
    case 'title': 
      assert.isString(paramValues.title, 'title');
      return paramValues.title
    case 'icon': 
      assert.isString(paramValues.icon, 'icon');
      return paramValues.icon
    case 'terminateToken': 
      assert.isHex32(paramValues.terminateKey, 'terminateKey');
      return '0x'+ecdsa.hash(paramValues.terminateKey, 'hex');
    default:
      if (assert.isObject(param)) return getParam(param.id, paramValues);
      if (paramValues[param] === undefined) throw new Error('Missing constructor parameter: '+param)
      return paramValues[param];
  }
}
