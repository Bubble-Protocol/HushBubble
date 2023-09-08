import { Wallet } from '../Wallet';
import { getAccount, getNetwork, watchAccount, getWalletClient, getPublicClient, signMessage, disconnect } from 'wagmi/actions';
import { EventManager } from '../utils/EventManager';
import { assert } from '@bubble-protocol/core';
import { toEthereumSignature } from '@bubble-protocol/client';

const WALLET_STATE = {
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Implementation of the HushBubble Wallet class that uses the Bubble Private Cloud to provide the functionality.
 * The Bubble Private Cloud provides an API to deploy contracts to the Base-Goerli testnet, and to send and call
 * contract methods.
 */
export class RainbowKitWallet extends Wallet {

  state = WALLET_STATE.disconnected;
  account;
  closeWatchers = [];
  listeners = new EventManager(['connected']);

  constructor(applicationKey) {
    super();
    this.applicationKey = applicationKey;
    this.closeWatchers.push(watchAccount(this._handleAccountsChanged.bind(this)));
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  async isAvailable() {
    return Promise.resolve(true);
  }
  
  async isConnected() {
    return Promise.resolve(this.state === WALLET_STATE.connected);
  }

  async connect() {
    return Promise.resolve();
  }

  async disconnect() {
    disconnect();
    return Promise.resolve();
  }

  getAccount() {
    const acc = getAccount();
    if (acc) return acc.address;
    else return undefined;
  }
  
  getChain() {
    const { chain } = getNetwork();
    if (chain) return chain.id;
    else return undefined;
  }


  async deploy(sourceCode, params=[], options={}) {
    if (this.state === WALLET_STATE.unavailable) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();

    const txHash = await walletClient.deployContract({
      account: this.account,
      abi: sourceCode.abi,
      bytecode: sourceCode.bytecode || sourceCode.bin,
      args: params,
      chain: this.getChain(),
      ...options
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    return receipt.contractAddress;
  }

  async send(contractAddress, abi, method, params=[], options={}) { 
    throw new Error('RainbowKitWallet.send not yet implemented');
  }

  async call(contractAddress, abi, method, params=[]) {
    throw new Error('RainbowKitWallet.call not yet implemented');
  }

  async getCode(contractAddress) {
    const publicClient = getPublicClient();
    return publicClient.getBytecode({address: contractAddress});
  }

  async switchChain(chainId, chainName) {
    if (!assert.isHexString(chainId)) chainId = '0x'+chainId.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        throw {code: 'chain-missing', message: 'Add the chain to Metamask and try again', chain: {id: parseInt(chainId), name: chainName}};
      }
      else console.warn('switchChain error:', error);
      throw error;
    }
  }

  sign(msg) {
    return signMessage({account: this.getAccount(), message: msg});
  }

  getSignFunction() {
    const account = this.getAccount();
    return (hash) => {
      hash = hash.slice(0,2) === '0x' ? hash.slice(2) : hash;
      console.trace('signing message', hash, 'with account', account);
      return signMessage({account, message: hash})
        .then(toEthereumSignature);
    }
  }

  _handleAccountsChanged(acc) {
    if (acc && acc.address) {
      this.account = acc.address;
      console.trace('wallet account:', this.account);
      const newConnection = this.state === WALLET_STATE.disconnected;
      this.state = WALLET_STATE.connected;
      if (newConnection) this.listeners.notifyListeners('connected');
    }
    else {
      this.account = undefined;
      console.trace('wallet disconnected');
      this.state = WALLET_STATE.disconnected;
    }
  }

}


