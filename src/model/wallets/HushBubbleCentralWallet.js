import { ecdsa } from '@bubble-protocol/crypto';
import { bubbleProviders } from '@bubble-protocol/client';

const CHAIN = 84531;

const WALLET_STATE = {
  disconnected: 'disconnected',
  connected: 'connected'
}

export class HushBubbleCentralWallet {

  state = WALLET_STATE.connected;
  provider = new bubbleProviders.HTTPBubbleProvider("https://vault.bubbleprotocol.com/wallet/base-goerli");

  constructor(applicationKey) {
    this.applicationKey = applicationKey;
  }

  async isAvailable() {
    return true;
  }
  
  async connect() {
    this.state = WALLET_STATE.connected;
    return Promise.resolve();
  }

  async disconnect() {
    this.state = WALLET_STATE.disconnected;
    return Promise.resolve();
  }
  
  getAccount() {
    throw new Error('RemoteWallet does not have an account');
  }
  
  getAccounts() {
    throw new Error('RemoteWallet does not have accounts');
  }

  getChain() {
    return CHAIN;
  }

  async deploy(sourceCode, params=[], options={}) {
    const packet = {abi: sourceCode.abi, bytecode: sourceCode.bytecode, params};
    return this._post('deploy', packet, options);
  }

  async send(contract, sourceCode, method, params=[], options={}) { 
    const packet = {contract, abi: sourceCode.abi, method, params};
    return this._post('send', packet, options);
  }

  async call(contract, sourceCode, method, params=[], options={}) {
    const packet = {contract, abi: sourceCode.abi, method, params};
    return this._post('call', packet, options);
  }

  async encrypt() {
    throw new Error('RemoteWallet does not support the encrypt function');
  }

  async decrypt() {
    throw new Error('RemoteWallet does not support the decrypt function');
  }

  async switchChain() {
    throw new Error('Only Base Goerli is supported. Connect your own wallet to use other chains.');
  }

  sign() {
    throw new Error('RemoteWallet does not support the sign function');
  }

  getSignFunction() {
    return () => Promise.reject(new Error('RemoteWallet does not support the sign function'));
  }

  _post(method, packet, options) {
    console.trace('wallet.'+method, packet)
    if (this.state !== WALLET_STATE.connected) throw new Error('wallet is not available');
    const nonce = Date.now() + Math.random() * 100000;
    const packetToSign = {nonce, ...packet};
    const sig = this.applicationKey.sign(ecdsa.hash(packetToSign));
    return this.provider.post('send', {nonce, ...packet, sig, options});
  }

}


