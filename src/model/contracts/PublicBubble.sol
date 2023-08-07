// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ChatBubble.sol";
import "./AccessControlBits.sol";


contract PublicBubble is ChatBubble {

  address owner = msg.sender;
  bool terminated = false;

  function getAccessPermissions( address /*user*/, uint256 contentId ) external view override returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    if (contentId <= 100) return DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;
    else return READ_BIT | WRITE_BIT | APPEND_BIT;
  }

  function terminate(bytes memory /*terminateKey*/) external override {
    require(msg.sender == owner, "permission denied");
    terminated = true;
  }

}