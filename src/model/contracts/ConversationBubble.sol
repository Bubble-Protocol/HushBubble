// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";


contract ConversationBubble is AccessControlledStorage {

  address u1;
  address u2;
  bool terminated = false;

  constructor(address _user1, address _user2) {
    u1 = _user1;
    u2 = _user2;
  }

  function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    if (user != u1 && user != u2) return NO_PERMISSIONS;
    if (contentId <= 100) return DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;
    else return READ_BIT | WRITE_BIT | APPEND_BIT;
  }

  function terminate() public {
    require(msg.sender == u1 || msg.sender == u2, "permission denied");
    terminated = true;
  }

}