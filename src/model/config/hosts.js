import iconBubble from "../../assets/img/bubble-private-cloud-logo.png";

export const DEFAULT_HOSTS = [
  {
    name: "Bubble Private Cloud",
    hostname: "vault.bubbleprotocol.com",
    icon: iconBubble,
    chains: {
      1: {
        url: "wss://vault.bubbleprotocol.com/v2/ethereum"
      },
      137: {
        url: "wss://vault.bubbleprotocol.com/v2/polygon"
      },
      995: {
        url: "wss://vault.bubbleprotocol.com/v2/5ire"
      },
      43114: {
        url: "wss://vault.bubbleprotocol.com/v2/avalanche"
      },
      11155111: {
        url: "wss://vault.bubbleprotocol.com/v2/sepolia"
      },
      8453: {
        url: "wss://vault.bubbleprotocol.com/v2/base"
      }
    }
  }
];
