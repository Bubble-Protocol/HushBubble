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
        const id = fromBase64Url(details).toString('hex');
        this.account = '0x'+id.slice(0,40);
        this.delegate.publicKey = id.slice(40);
      }
      else {
        // assume it is already a Member object (or representation of one)
        this.title = details.title;
        this.icon = details.icon;
        this.account = details.account || details.address; // address is for backwards compatibility
        if (this.account.slice(0,2) !== '0x') this.account = '0x'+this.account;
        this.delegate.publicKey = details.delegate ? details.delegate.publicKey || details.delegate : details.publicKey; // publicKey is for backwards compatibility
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
