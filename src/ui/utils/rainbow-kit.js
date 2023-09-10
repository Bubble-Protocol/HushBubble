import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { base, mainnet, polygon, avalanche, baseGoerli, sepolia } from 'wagmi/chains';


const WALLET_CONNECT_PROJECT_ID = 'YOUR_PROJECT_ID';


const { chains, publicClient } = configureChains(
  [base, polygon, avalanche, mainnet, baseGoerli, sepolia],
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