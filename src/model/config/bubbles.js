import * as oneToOneChatSourceCode from "../contracts/chat-types/OneToOne/OneToOneBubble.json";
import * as publicChatSourceCode from "../contracts/chat-types/Public/PublicBubble.json";
import * as publicEventChatSourceCode from "../contracts/chat-types/PublicEvent/PublicEventBubble.json";
import * as groupChatSourceCode from "../contracts/chat-types/Group/GroupBubble.json";
import * as erc721ChatSourceCode from "../contracts/chat-types/ERC721/ERC721Bubble.json";
import * as erc1155ChatSourceCode from "../contracts/chat-types/ERC1155/ERC1155Bubble.json";
import * as friendtechSourceCode from "../contracts/chat-types/FriendTech/FriendTechBubble.json";
import simpleChatIcon from "../../assets/img/users.png";
import globeIcon from "../../assets/img/globe.png";
import groupIcon from "../../assets/img/group.png";
import publicEventIcon from "../../assets/img/volume.png";
import nftIcon from "../../assets/img/nft.png";
import friendtechIcon from "../../assets/img/friendtech.png";


export const DEFAULT_BUBBLES = [
  {
    title: "Public Chat", // Original HushBubble Public Chat (cannot construct)
    description: "Anyone can join", 
    details: "Unencrypted public chat with no restrictions.", 
    id: {category: 'original-hushbubble-public-chat', bytecodeHash: '2facecba5b9061ea6a3f550a87d0baa412b9b18ca45a7d7fdd0fd0f8d984396c'}, 
    classType: 'PublicChat', 
    sourceCode: publicChatSourceCode.default, 
    constructorParams: [], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      canConstruct: false,
      canDelete: false
    },
    icon: globeIcon
  },
  {
    title: "One-to-One Chat", 
    description: "Connect with a friend and start an end-to-end encrypted chat", 
    details: "Two person, end-to-end encrypted chat. No-one, not even HushBubble, can read your messages.", 
    id: {category: 'one-to-one', bytecodeHash: '6a50777810fb784389b557b9058fd0d5eea28466d0711fca6a31a36252a356e9'}, 
    classType: 'OneToOneChat', 
    sourceCode: oneToOneChatSourceCode.default, 
    constructorParams: ['member0.account', 'member1.account', 'terminateToken'],
    metadata: {member0: 'member0.id', member1: 'member1.id'},
    actions: {
      canConstruct: true,
      canLeave: false,
    },
    icon: simpleChatIcon
  },
  {
    title: "Private Group Chat", 
    description: "End-to-end encrypted group chat where everyone is equal", 
    details: "End-to-end encrypted group chat where all members have the same permissions and any member can add and remove others. All but one member must leave the group before it can be deleted. No-one, not even HushBubble, can read your messages.", 
    id: {category: 'group', bytecodeHash: 'eca0e2dbb39f268cfff4c54f90d8c0d3e8e69aa731e7deee941cd08b47345d3b'},
    classType: 'PrivateChat', 
    sourceCode: groupChatSourceCode.default, 
    constructorParams: ['members.account', 'terminateToken'], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      canConstruct: true,
      addMembers: {method: 'setUsers', params: ['members.account', 'true']},
      removeMembers: {method: 'setUsers', params: ['members.account', 'false']},
    },
    icon: groupIcon
  },
  {
    title: "Public Chat", 
    description: "Unencrypted group chat that anyone can join", 
    details: "Unencrypted public chat with no restrictions.", 
    id: {category: 'public', bytecodeHash: '1cc04f1670339fb356fae402c8b20a69ec585d90526d4798a30d793102e2d776'}, 
    classType: 'PublicChat', 
    sourceCode: publicChatSourceCode.default, 
    constructorParams: [], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      canConstruct: true,
    },
    icon: globeIcon
  },
  {
    title: "Public Event", 
    description: "Unencrypted group chat that anyone can join, but only permitted users can post", 
    details: "Unencrypted public chat with write permission limited to users you grant access.", 
    id: {category: 'public', bytecodeHash: '41ef5d0a546851b6277619540ba5bf19629374d1157dfde59c84518013b7724d'}, 
    classType: 'PublicChat', 
    sourceCode: publicEventChatSourceCode.default, 
    constructorParams: ['members.account'], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      canConstruct: true,
      addMembers: {method: 'setUsers', params: ['members.account', 'true']},
      removeMembers: {method: 'setUsers', params: ['members.account', 'false']},
      canWrite: true  // {method: 'isUser', params: ['my.checksum-account']}
    },
    icon: publicEventIcon
  },
  {
    title: "friend.tech Chat", 
    description: "Unencrypted group chat that only your friend.tech key holders can join", 
    details: "Only your friend.tech key holders can access the chat. You MUST be logged in to HushBubble with your friend.tech account to create this chat.", 
    id: {category: 'public', bytecodeHash: '928726f9072f58097631fc0d852b6666b48559406f9637cd0374e4f5af714f17'}, 
    classType: 'PublicChat', 
    sourceCode: friendtechSourceCode.default, 
    constructorParams: [], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      canConstruct: true,
      canDelete: true  // {method: 'canDelete', params: ['my.account']},
    },
    icon: friendtechIcon,
    limitToChains: [8453]
  },
  {
    title: "NFT Chat (ERC721)", 
    description: "Unencrypted group chat that only your NFT owners can join", 
    details: "Only owners of the ERC721 contract can access the chat.", 
    id: {category: 'public', bytecodeHash: '82529b8fe9aab266baedd7be8feb501bfa1aa0f954411c23dff1884bf1d5cd43'}, 
    classType: 'PublicChat', 
    sourceCode: erc721ChatSourceCode.default, 
    constructorParams: [
      {id: 'nft-contract', type: 'address', title: 'NFT Contract', subtitle: 'The ERC721 contract that controls the members of this chat'}, 
      'my.address'
    ], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      requiresDelegate: true,
      canConstruct: true,
      canDelete: true  // {method: 'canDelete', params: ['my.account']},
    },
    icon: nftIcon
  },
  {
    title: "NFT Chat (ERC1155)", 
    description: "Unencrypted group chat that only your NFT owners can join", 
    details: "Only owners of the ERC1155 contract and token ID can access the chat.", 
    id: {category: 'public', bytecodeHash: '3554d7214ef318dda9a0cbfa742cdc4a419f8564c81f27b448981459580935b8'}, 
    classType: 'PublicChat', 
    sourceCode: erc1155ChatSourceCode.default, 
    constructorParams: [
      {id: 'nft-contract', type: 'address', title: 'NFT Contract', subtitle: 'The ERC1155 contract that controls the members of this chat'}, 
      {id: 'nft-id', type: 'uint256', title: 'NFT ID', subtitle: 'The ID of the token within the ERC1155 contract'}, 
      'my.account'
    ], 
    metadata: {title: 'title', icon: 'icon'},
    actions: {
      requiresDelegate: true,
      canConstruct: true,
      canDelete: true  // {method: 'canDelete', params: ['my.account']},
    },
    icon: nftIcon
  },
  {id: {category: 'group', bytecodeHash: ''}, title: "Moderated Group Chat", description: "Coming Soon! - Group chat with admin controls", classType: 'PrivateChat', sourceCode: groupChatSourceCode.default, actions: {canConstruct: true}, disabled: true},
  {id: {category: 'custom', bytecodeHash: ''}, title: "Custom Chat", description: "Coming Soon! - Your chat, your rules", sourceCode: groupChatSourceCode.default, actions: {canConstruct: true}, disabled: true},
]