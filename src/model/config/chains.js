import iconEtheruem from "../../assets/img/eth-logo.png";
import iconPolygon from "../../assets/img/polygon-logo.png";
import iconAvalanche from "../../assets/img/avalanche-logo.png";
import iconSepolia from "../../assets/img/sepolia-logo.png";
import iconBaseGoerli from "../../assets/img/base-goerli-logo.png";
import iconBase from "../../assets/img/base-logo.webp";

export const DEFAULT_CHAINS = [
  {name: "Polygon", id: 137, icon: iconPolygon, publicBubble: "0x27b9F83D7B18b56f3Cb599Af90EfB12D0Dda656b" },
  {name: "Ethereum", id: 1, icon: iconEtheruem, publicBubble: "0xf9F287Eb990a65784F599a3F5670c8E14071F473"},
  {name: "Avalanche", id: 43114, icon: iconAvalanche, publicBubble: "0xF6656646ECf7bD4100ec0014163F6CaD44eA1715"},
  {name: "Sepolia (testnet)", id: 11155111, icon: iconSepolia, publicBubble: "0xfd40865D98C15334Be883050DdF150c729584e7D"},
  {name: "Base Goerli (testnet)", id: 84531, icon: iconBaseGoerli, publicBubble: "0x73eF7A3643aCbC3D616Bd5f7Ee5153Aa5f14DB30"},
  {name: "Base", id: 8453, icon: iconBase, publicBubble: "0xF6656646ECf7bD4100ec0014163F6CaD44eA1715"},
]

