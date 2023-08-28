// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ChatBubble.sol";
import "../../AccessControlBits.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";


contract ERC721Bubble is ChatBubble {

  IERC721 public nftContract;
  address owner = msg.sender;
  address proxyOwner; // TODO, when wallet integration is complete, no need for proxy owner
  bool terminated = false;

  constructor(IERC721 nft, address _owner) {
    nftContract = nft;
    proxyOwner = _owner;
  }

  function getAccessPermissions(address user, uint256 contentId) override public view returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    uint directoryBit = contentId <= 100 ? DIRECTORY_BIT : 0;
    if (user == proxyOwner) return directoryBit | READ_BIT | WRITE_BIT | APPEND_BIT;
    if (user == owner && contentId == 0) return WRITE_BIT;
    else if (contentId == 0) return NO_PERMISSIONS;
    else if (contentId != 0 && nftContract.balanceOf(user) > 0) return directoryBit | READ_BIT | APPEND_BIT;
    else return NO_PERMISSIONS;
  }

  function canDelete(address _user) external view returns (bool) {
    return _user == proxyOwner;
  }

  function terminate(bytes memory /*terminateKey*/) external override {
    require(getAccessPermissions(msg.sender, 0) & WRITE_BIT > 0, "permission denied");
    terminated = true;
  }
    
}