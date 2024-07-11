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
  contracts: {
    // multicall3: {
    //   address: '0xca11bde05977b3631167028862be2a173976ca11',
    //   blockCreated: 11_907_934,
    // },
  }  
}


const { chains, publicClient } = configureChains(
  [polygon, fireChain, base, avalanche, mainnet, sepolia],
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