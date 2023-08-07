import * as oneToOneChatSourceCode from "../contracts/OneToOneBubble.json";
import * as publicChatSourceCode from "../contracts/PublicBubble.json";
import * as groupChatSourceCode from "../contracts/GroupBubble.json";
import simpleChatIcon from "../../assets/img/users.png";
import { ecdsa } from "@bubble-protocol/crypto";


export const DEFAULT_BUBBLES = [
  {
    title: "One-to-One Chat", 
    description: "Encrypted chat between two people", 
    details: "Two person, end-to-end encrypted chat. No-one, not even HushBubble, can read your messages.", 
    id: {category: 'one-to-one', bytecodeHash: '6a50777810fb784389b557b9058fd0d5eea28466d0711fca6a31a36252a356e9'}, 
    classType: 'PrivateChat', 
    sourceCode: oneToOneChatSourceCode.default, 
    constructorParams: ['member0', 'member1', 'terminateToken'], 
    icon: simpleChatIcon
  },
  {id: {category: 'group', contractHash: ''}, title: "Group Chat", description: "Group chat where everyone is equal", classType: 'PrivateChat', sourceCode: groupChatSourceCode.default, disabled: true},
  {id: {category: 'group', contractHash: ''}, title: "Moderated Group Chat", description: "Group chat with admin controls", classType: 'PrivateChat', sourceCode: groupChatSourceCode.default, disabled: true},
  {id: {category: 'group', contractHash: ''}, title: "NFT Chat", description: "Chat with other NFT owners", sourceCode: groupChatSourceCode.default, disabled: true},
  {id: {category: 'public', contractHash: ''}, title: "Public Chat", description: "Anyone can join", classType: 'PublicChat', sourceCode: publicChatSourceCode.default, constructorParams: [], disabled: true},
  {id: {category: 'public', contractHash: ''}, title: "Public Event", description: "Group chat with public read", sourceCode: groupChatSourceCode.default, disabled: true},
  {id: {category: 'custom', contractHash: ''}, title: "Custom Chat", description: "Your chat, your rules", sourceCode: groupChatSourceCode.default, disabled: true},
]