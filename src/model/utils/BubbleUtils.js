import { Bubble } from "@bubble-protocol/client";
import { WebsocketBubbleProvider } from "@bubble-protocol/client/src/bubble-providers/WebsocketBubbleProvider";
import { ecdsa } from "@bubble-protocol/crypto";

export function testProviderExists(chainId, url, contract) {
  console.trace('verifying provider exists', url);
  const provider = new WebsocketBubbleProvider(url);
  return provider.connect()
    .then(() => {
      const bubbleId = {
        chain: chainId,
        contract: contract,
        provider: url
      }
      const key = new ecdsa.Key();
      const bubble = new Bubble(bubbleId, provider, key.signFunction);
      return bubble.getPermissions(bubble.toFileId(1))
    })
    .then(() => {
      console.trace('provider is available');
    })
    .catch(error => {
      throw new Error("host is not available", {cause: error});
    })
}

