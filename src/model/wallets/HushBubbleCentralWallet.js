import { ecdsa } from '@bubble-protocol/crypto';
import { Bubble, bubbleProviders } from '@bubble-protocol/client';
import { DEFAULT_CONFIG } from '../config';
import { Wallet } from './Wallet';

const CHAIN = 84531;

const WALLET_STATE = {
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Implementation of the HushBubble Wallet class that uses the Bubble Private Cloud to provide the functionality.
 * The Bubble Private Cloud provides an API to deploy contracts to the Base-Goerli testnet, and to send and call
 * contract methods.
 */
export class HushBubbleCentralWallet extends Wallet {

  state = WALLET_STATE.connected;
  provider = new bubbleProviders.WebsocketBubbleProvider(DEFAULT_CONFIG.walletUrl, {sendTimeout: 60000});

  constructor(applicationKey) {
    super();
    this.applicationKey = applicationKey;
  }

  async isAvailable() {
    return Promise.resolve(true);
  }
  
  async connect() {
    return this.provider.connect()
      .then(() => this.state = WALLET_STATE.connected);
  }

  async disconnect() {
    return this.provider.close()
      .then(() => this.state = WALLET_STATE.connected);
  }

  getAccount() {
    throw new Error('RemoteWallet does not have an account');
  }
  
  getChain() {
    return CHAIN;
  }

  async deploy(sourceCode, params=[], options={}) {
    const packet = {abi: sourceCode.abi, bytecode: sourceCode.bytecode || sourceCode.bin, params};
    return this._post('deploy', packet, options)
      .then(receipt => receipt.options.address);
  }

  async send(contract, abi, method, params=[], options={}) { 
    const packet = {contract, abi: abi, method, params};
    return this._post('send', packet, options);
  }

  async call(contract, abi, method, params=[], options={}) {
    const packet = {contract, abi: abi, method, params};
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
    const sig = this.applicationKey.sign(ecdsa.hash(JSON.stringify(packetToSign)));
    const bubble = new Bubble({chain: CHAIN, contract: DEFAULT_CONFIG.bubbleId.contract, provider: DEFAULT_CONFIG.walletUrl}, this.provider, this.applicationKey.signFunction);
    return bubble.post({method: method, params: {nonce, ...packet, sig, options}});
    // return this.provider.post(method, {nonce, ...packet, sig, options});
  }

}


