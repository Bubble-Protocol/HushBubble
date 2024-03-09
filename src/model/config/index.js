import { ContentId } from "@bubble-protocol/core";
import { DEFAULT_BUBBLES } from "./bubbles";
import { DEFAULT_CHAINS } from "./chains";
import { DEFAULT_HOSTS } from "./hosts";

export const DEFAULT_CONFIG = {
  appUrl: "https://bubbleprotocol.com/chat",
  profileRegistry: new ContentId({
    chain: 8453,
    contract: '0x901dB5a41E6Af7884cF8DB1cEe657A425dFC172b',
    provider: 'wss://vault.bubbleprotocol.com/v2/base'
  }),
  connectionRelay: {
    chain: 8453,
    contract: '0x45fD2D2c6b8cC6BA39d834B41D248a470F8a974b',
    provider: "wss://vault.bubbleprotocol.com/v2/base"
  },
  chains: DEFAULT_CHAINS,
  hosts: DEFAULT_HOSTS,
  bubbles: DEFAULT_BUBBLES,
  defaultChainId: 137
}
