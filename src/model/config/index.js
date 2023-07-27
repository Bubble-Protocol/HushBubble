import { ContentId } from "@bubble-protocol/core";
import { DEFAULT_BUBBLES } from "./bubbles";
import { DEFAULT_CHAINS } from "./chains";
import { DEFAULT_HOSTS } from "./hosts";

export const DEFAULT_CONFIG = {
  appUrl: "https://bubbleprotocol.com/chat",
  bubbleId: new ContentId({
    chain: 137,
    contract: '0xf9F287Eb990a65784F599a3F5670c8E14071F473',
    provider: 'wss://vault.bubbleprotocol.com/v2/polygon'
  }),
  chains: DEFAULT_CHAINS,
  hosts: DEFAULT_HOSTS,
  bubbles: DEFAULT_BUBBLES
}
