import { ContentId } from "@bubble-protocol/core";

export const DEFAULT_CONFIG = {
  bubbleId: new ContentId({
    chain: 84531,
    contract: '0x53c3A5ffa39546baB673B78d8D75fD9419069097',
    provider: 'wss://vault.bubbleprotocol.com/v2/base-goerli'
  })
}
