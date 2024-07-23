import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { base, mainnet, polygon, avalanche, sepolia } from 'wagmi/chains';


const WALLET_CONNECT_PROJECT_ID = 'be5ecff22a547fe5ff88a79a14eb5bae'; // 'YOUR_PROJECT_ID';

const fireChain = {
  id: 995,
  name: '5ire',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/16919.png',
  iconBackground: '#fff',
  nativeCurrency: { name: '5ire', symbol: '5ire', decimals: 18 },
  network: '5irechain',
  rpcUrls: {
    default: { http: ['https://rpc.5ire.network'] },
    public: { http: ['https://rpc.5ire.network'] }
  },
  blockExplorers: {
    default: { name: '5ireScan', url: 'https://preview.5ire.network' },
  },
  contracts: {}  
}

const scrollChain = {
  id: 534352,
  name: 'Scroll',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/26998.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  network: 'scroll',
  rpcUrls: {
    default: { http: ['https://rpc.scroll.io'] },
    public: { http: ['https://rpc.scroll.io'] }
  },
  blockExplorers: {
    default: { name: 'ScrollScan', url: 'https://scrollscan.com' },
  },
  contracts: {}  
}


const { chains, publicClient } = configureChains(
  [polygon, fireChain, base, avalanche, mainnet, scrollChain, sepolia],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'HushBubble',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export const rainbowKitConfig = {
  wagmiConfig,
  chains
};