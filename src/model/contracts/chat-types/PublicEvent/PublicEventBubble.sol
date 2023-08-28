// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ChatBubble.sol";
import "../../AccessControlBits.sol";

// TODO When wallet connectivity is available, change this chat to use the terminateKey
// TODO Create a multi-user manager that reverts to public access and a public encryption policy if no user metadata file exists for the user.

contract PublicEventBubble is ChatBubble {

  address owner = msg.sender;
  mapping(address => bool) users;
  bool terminated = false;

  constructor(address[] memory _users) {
    for(uint i=0; i<_users.length; i++) {
      users[_users[i]] = true;
    }
  }

  function setUsers(address[] memory _users, bool state)  external {
    require(users[msg.sender] || msg.sender == owner, "permission denied");
    for(uint i=0; i<_users.length; i++) {
      users[_users[i]] = state;
    }
  }

  function isUser(address _user) external view returns (bool) {
    return users[_user];
  }

  function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    uint directoryBit = contentId <= 100 ? DIRECTORY_BIT : 0;
    if (users[user]) return directoryBit | READ_BIT | WRITE_BIT | APPEND_BIT;
    else return directoryBit | READ_BIT;
  }

  function terminate(bytes memory /*terminateKey*/) external override {
    require(msg.sender == owner, "permission denied");
    terminated = true;
  }

}