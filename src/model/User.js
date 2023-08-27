import { ecdsa } from "@bubble-protocol/crypto";
import { fromBase64Url, toBase64Url } from "./utils/StringUtils";
import { assert } from "@bubble-protocol/core";

export class User {

  id;
  account;
  delegate = {};
  title;
  icon;

  constructor(details) {
    try {
      assert.isNotNull(details, 'details');
      if (ecdsa.assert.isCompressedPublicKey(details)) {
        this.account = ecdsa.publicKeyToAddress(details);
        this.delegate.publicKey = details;
      }
      else if (assert.isHexString(details)) {
        // assume it is a decoded id
        if (details.length !== 104) throw '';
        this.account = '0x'+details.slice(0,40);
        this.delegate.publicKey = details.slice(40);
      }
      else if (assert.isString(details)) {
        // assume it is an id
        const {account, delegate} = parseId(details);
        this.account = account;
        this.delegate = delegate;
      }
      else {
        // assume it is already a Member object (or representation of one)
        const publicKey = details.delegate ? details.delegate.publicKey || details.delegate : details.publicKey;
        const accountAddress = details.account || details.address; // address is for backwards compatibility
        const {account, delegate} = details.id ? parseId(details.id, accountAddress) : {account: accountAddress, delegate: {publicKey: publicKey}};
        this.title = details.title;
        this.icon = details.icon;
        this.account = account;
        this.delegate = delegate;
        if (this.account.slice(0,2) !== '0x') this.account = '0x'+this.account;
        if (this.delegate.publicKey.slice(0,2) === '0x') this.delegate.publicKey = this.delegate.publicKey.slice(2);
      }
      ecdsa.assert.isAddress(this.account, 'account');
      ecdsa.assert.isCompressedPublicKey(this.delegate.publicKey, 'delegate.publicKey');
      this.id = toBase64Url(Buffer.from(this.account.slice(2)+this.delegate.publicKey, 'hex'));
      this.delegate.address = ecdsa.publicKeyToAddress(this.delegate.publicKey);
    }
    catch(error) {
      console.warn('failed to construct User:', error);
      throw new Error('Cannot construct user', {cause: details})
    }
  }

  getEciesPublicKey() { return this.delegate.publicKey }

  getEciesAddress() { return this.delegate.address }

  getAccount() { return this.account }

  getKnownAs() { return this.title || this.account.slice(2,6)+'..'+this.account.slice(-4) }

  getId() { return this.id }

}


function parseId(idStr, account) {
  const id = fromBase64Url(idStr).toString('hex');
  if (id.length === 64 || id.length === 66) {
    // old id format - just delegate public key
    return {
      delegate: {publicKey: id},
      account: account || ecdsa.publicKeyToAddress(id)
    }
  }
  else {
    return {
      delegate: {publicKey: id.slice(40)},
      account: '0x'+id.slice(0,40)
    }
  }
}