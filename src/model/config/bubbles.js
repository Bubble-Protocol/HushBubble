import * as simpleChatSourceCode from "../contracts/ConversationBubble.json";
import * as groupChatSourceCode from "../contracts/GroupBubble.json";
import simpleChatIcon from "../../assets/img/users.png";


export const DEFAULT_BUBBLES = [
  {title: "Simple Chat", description: "One-to-one chat", details: "Simple chat between two people. Simple chats are end-to-end encrypted. No-one, not even HushBubble, can read your messages.", sourceCode: simpleChatSourceCode.default, icon: simpleChatIcon},
  {title: "Group Chat", description: "Group chat where everyone is equal", sourceCode: groupChatSourceCode.default, disabled: true},
  {title: "Moderated Group Chat", description: "Group chat with admin controls", sourceCode: groupChatSourceCode.default, disabled: true},
  {title: "NFT Chat", description: "Chat with other NFT owners", sourceCode: groupChatSourceCode.default, disabled: true},
  {title: "Public Chat", description: "Anyone can join", sourceCode: groupChatSourceCode.default, disabled: true},
  {title: "Public Event", description: "Group chat with public read", sourceCode: groupChatSourceCode.default, disabled: true},
  {title: "Custom Chat", description: "Your chat, your rules", sourceCode: groupChatSourceCode.default, disabled: true},
]