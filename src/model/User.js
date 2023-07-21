import { ecdsa } from "@bubble-protocol/crypto";
import { fromBase64Url, toBase64Url } from "./utils/StringUtils";
import { assert } from "@bubble-protocol/core";

export class User {

  constructor(details) {
    try {
      this.publicKey = details.publicKey;
      if (assert.isHexString(details)) {
        // assume it is a public key
        this.publicKey = details;
      }
      else if (assert.isString(details)) {
        // assume it is an id
        this.publicKey = fromBase64Url(details).toString('hex');
      }
      else {
        // assume it is already a Member object (or representation of one)
        this.title = details.title;
        this.icon = details.icon;
        this.publicKey = details.publicKey;
      }
      this.id = toBase64Url(Buffer.from(this.publicKey, 'hex'));
      this.address = ecdsa.publicKeyToAddress(this.publicKey);
    }
    catch(_) {
      throw new Error('Cannot construct conversation member from these details:', details)
    }
  }

}
