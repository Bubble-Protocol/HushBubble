import iconEtheruem from "../../assets/img/eth-logo.png";
import iconPolygon from "../../assets/img/polygon-logo.png";
import iconAvalanche from "../../assets/img/avalanche-logo.png";
import iconSepolia from "../../assets/img/sepolia-logo.png";
import iconBase from "../../assets/img/base-logo.webp";
import icon5ire from "../../assets/img/5ire-logo.png";

export const DEFAULT_CHAINS = [
  {name: "5ire", id: 995, icon: icon5ire, publicBubble: "0x4037E81D79aD0E917De012dE009ff41c740BB453"},
  {name: "Polygon", id: 137, icon: iconPolygon, publicBubble: "0x27b9F83D7B18b56f3Cb599Af90EfB12D0Dda656b" },
  {name: "Ethereum", id: 1, icon: iconEtheruem, publicBubble: "0xf9F287Eb990a65784F599a3F5670c8E14071F473"},
  {name: "Avalanche", id: 43114, icon: iconAvalanche, publicBubble: "0xF6656646ECf7bD4100ec0014163F6CaD44eA1715"},
  {name: "Sepolia (testnet)", id: 11155111, icon: iconSepolia, publicBubble: "0xfd40865D98C15334Be883050DdF150c729584e7D"},
  {name: "Base", id: 8453, icon: iconBase, publicBubble: "0xF6656646ECf7bD4100ec0014163F6CaD44eA1715"},
]

