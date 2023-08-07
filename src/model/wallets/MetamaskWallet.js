import Web3 from 'web3';
import { ecies } from '@bubble-protocol/crypto';
import { assert } from '@bubble-protocol/core';
import { toEthereumSignature } from '@bubble-protocol/client';
import { Wallet } from './Wallet';

const web3 = new Web3(window.ethereum);

const WALLET_STATE = {
  unavailable: 'unavailable',
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Implementation of the HushBubble Wallet class that uses Metamask to provide the functionality
 */
export class MetamaskWallet extends Wallet {

  state = WALLET_STATE.unavailable;
  chainId;
  accounts = [];

  async isAvailable() {

    function detectMetamask() {
      return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    }
  
    return new Promise((resolve) => {
      if (detectMetamask()) resolve(true);
      else {
        let eventFired = false;
        window.addEventListener('ethereum#initialized', () => {eventFired = true; resolve(detectMetamask())}, {
          once: true,
        });
        setTimeout(() => {
          resolve(detectMetamask())
        }, 3000);
      }
    })
    .then(available => {
      // window.ethereum.on('accountsChanged', this._setAccounts.bind(this));
      // window.ethereum.on('chainChanged', () => { this._setChain.bind(this) });
      this.state = WALLET_STATE.disconnected;
      return available;
    });
  }
  
  async isConnected() {
    return Promise.resolve(this.state === WALLET_STATE.connected);
  }

  async connect() {
    this.chainId = window.ethereum.networkVersion;
    return window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(this._setAccounts.bind(this))
  }

  async disconnect() {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    this.state = WALLET_STATE.disconnected;
    this.publicKey = undefined;
    return Promise.resolve();
  }
  
  getAccount() {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    return this.accounts[0];
  }
  
  getAccounts() {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    return this.accounts;
  }

  getChain() {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    return parseInt(this.chainId);
  }

  _setAccounts(accounts) {
    if (accounts && accounts.length > 0) this.accounts = accounts;
    else this.accounts = [];
    this.state = WALLET_STATE.connected;
    return this.accounts[0];
  }

  _setChain(chainId) {
    this.chainId = chainId;
  }

  on(event, listener) {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    window.ethereum.on(event, listener);
  }

  off(event, listener) {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    window.ethereum.off(event, listener);
  }

  async deploy(sourceCode, params=[], options={}) {
    if (this.state === WALLET_STATE.unavailable) throw new Error('wallet is not available');
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(sourceCode.abi);
    return contract.deploy({ data: sourceCode.bytecode || sourceCode.bin, arguments: params, ...options })
      .send({from: this.getAccount()})
      .then(contract => {
        return contract.options.address}
      );
  }

  async send(contractAddress, abi, method, params=[], options={}) { 
    const contract = new web3.eth.Contract(abi, contractAddress);
    return contract.methods[method](params).send({from: this.getAccount(), ...options});
  }

  async call(contractAddress, abi, method, params=[]) {
    const contract = new web3.eth.Contract(abi, contractAddress);
    return contract.methods[method](params).call({from: this.getAccount()});
  }

  async getCode(contractAddress) {
    return web3.eth.getCode(contractAddress);
  }

  async encrypt(data) {
    // TODO establish a wallet encryption strategy.  eth_getEncryptionPublicKey and eth_decrypt are depreciated 
    // TODO in Metamask but it provides no alternative.  In principle, the signing key should not be used for 
    // TODO encryption without careful consideration
    return this.getPublicKey()
      .then(publicKey => {
        return ecies.encrypt(publicKey, data);
      })
  }

  async decrypt(data) {
    // TODO see encrypt
    return window.ethereum.request({ method: 'eth_decrypt', params: [data, this.accounts[0]] });
  }

  async switchChain(chainId) {
    if (!assert.isHexString(chainId)) chainId = '0x'+chainId.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        throw new Error('Add the chain to Metamask and try again');
      }
      else console.warn('switchChain error:', error);
      throw error;
    }
  }

  sign(msg) {
    return web3.eth.personal.sign(msg, this.getAccount(), '')
  }

  getSignFunction() {
    const account = this.getAccount();
    return (hash) => {
      hash = hash.slice(0,2) === '0x' ? hash.slice(2) : hash;
      return web3.eth.personal.sign(hash, account, '')
        .then(toEthereumSignature);
    }
  }

}
