import { Wallet } from '../Wallet';
import { getAccount, getNetwork, watchAccount, getWalletClient, getPublicClient, signMessage, disconnect, switchNetwork } from 'wagmi/actions';
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
  listeners = new EventManager(['connected', 'disconnected']);

  constructor(applicationKey) {
    super();
    this.applicationKey = applicationKey;
    this.closeWatchers.push(watchAccount(this._handleAccountsChanged.bind(this)));
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  async isAvailable() {
    const acc = getAccount();
    return Promise.resolve(!!acc);
  }
  
  async isConnected() {
    const acc = getAccount();
    return Promise.resolve(assert.isObject(acc) ? acc.isConnected : false);
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

    const chainId = this.getChain();
    const walletClient = await getWalletClient({chainId});
    const publicClient = getPublicClient({chainId});

    const txHash = await walletClient.deployContract({
      account: this.account,
      abi: sourceCode.abi,
      bytecode: sourceCode.bytecode || sourceCode.bin,
      args: params,
      ...options
    });

    console.trace('txHash', txHash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.trace('receipt', receipt);

    return receipt.contractAddress;
  }

  async send(contractAddress, abi, method, params=[], options={}) { 
    if (this.state === WALLET_STATE.unavailable) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const walletClient = await getWalletClient({chainId});
    const publicClient = getPublicClient({chainId});

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params,
      ...options
    })

    console.trace('txHash', txHash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.trace('receipt', receipt);

    return receipt;
  }

  async call(contractAddress, abi, method, params=[]) {
    if (this.state === WALLET_STATE.unavailable) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const publicClient = getPublicClient({chainId});

    return await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params
    })
  }

  async getCode(contractAddress) {
    const chainId = this.getChain();
    const publicClient = getPublicClient({chainId});
    return publicClient.getBytecode({address: contractAddress});
  }

  async switchChain(chainId, chainName) {
    if (assert.isString(chainId)) chainId = parseInt(chainId);
    try {
      const chain = await switchNetwork({chainId});
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
      const newDisconnection = this.state !== WALLET_STATE.disconnected;
      this.state = WALLET_STATE.disconnected;
      if (newDisconnection) this.listeners.notifyListeners('disconnected');
    }
  }

}


