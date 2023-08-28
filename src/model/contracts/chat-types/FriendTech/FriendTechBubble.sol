// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ChatBubble.sol";
import "../../AccessControlBits.sol";

abstract contract FriendtechSharesV1 {

  function sharesBalance(address subject, address holder) public virtual view returns (uint256);

}

contract FriendTechBubble is ChatBubble {

  FriendtechSharesV1 friendtech = FriendtechSharesV1(0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4);
  address owner = msg.sender;
  bool terminated = false;

  function getAccessPermissions(address user, uint256 contentId) override public view returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    uint directoryBit = contentId <= 100 ? DIRECTORY_BIT : 0;
    if (user == owner) return directoryBit | READ_BIT | WRITE_BIT | APPEND_BIT;
    else if (contentId == 0) return NO_PERMISSIONS;
    else if (contentId != 0 && friendtech.sharesBalance(owner, user) > 0) return directoryBit | READ_BIT | APPEND_BIT;
    else return NO_PERMISSIONS;
  }

  function canDelete(address _user) external view returns (bool) {
    return _user == owner;
  }

  function terminate(bytes memory /*terminateKey*/) external override {
    require(msg.sender == owner, "permission denied");
    terminated = true;
  }

}