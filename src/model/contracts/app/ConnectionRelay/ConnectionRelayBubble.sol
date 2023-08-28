// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../AccessControlledStorage.sol";
import "../../AccessControlBits.sol";


contract ConnectionRelayBubble is AccessControlledStorage {

  address public owner = msg.sender;
  bool terminated = false;

  function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    else if (contentId == 0 && user != owner) return NO_PERMISSIONS;
    else return DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;
  }

  function terminate() external {
    require(msg.sender == owner, "permission denied");
    terminated = true;
  }

}