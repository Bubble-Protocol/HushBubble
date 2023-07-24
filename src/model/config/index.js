import { ContentId } from "@bubble-protocol/core";

export const DEFAULT_CONFIG = {
  bubbleId: new ContentId({
    chain: 137,
    contract: '0xf9F287Eb990a65784F599a3F5670c8E14071F473',
    provider: 'wss://vault.bubbleprotocol.com/v2/polygon'
  })
}
