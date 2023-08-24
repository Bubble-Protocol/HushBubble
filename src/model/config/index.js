import { ContentId } from "@bubble-protocol/core";
import { DEFAULT_BUBBLES } from "./bubbles";
import { DEFAULT_CHAINS } from "./chains";
import { DEFAULT_HOSTS } from "./hosts";

export const DEFAULT_CONFIG = {
  appUrl: "https://bubbleprotocol.com/chat",
  profileRegistry: new ContentId({
    chain: 84531,
    contract: '0xaC136c8a856C38CC9760677E6AfDDe3E2886bA49',
    provider: 'wss://vault.bubbleprotocol.com/v2/base-goerli'
  }),
  connectionRelay: {
    chain: 84531,
    contract: '0xDC8bb7aa04431BC0Edc5F0373B98824eC184CFbF',
    provider: "wss://vault.bubbleprotocol.com/v2/base-goerli"
  },
  chains: DEFAULT_CHAINS,
  hosts: DEFAULT_HOSTS,
  bubbles: DEFAULT_BUBBLES,
  defaultChainId: 8453
}
