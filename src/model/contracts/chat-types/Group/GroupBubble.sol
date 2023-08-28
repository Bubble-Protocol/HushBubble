// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ChatBubble.sol";
import "../../AccessControlBits.sol";


contract GroupBubble is ChatBubble {

  address owner = msg.sender;
  int userCount = 0;
  mapping(address => bool) users;
  bool terminated = false;
  bytes32 terminateToken;

  constructor(address[] memory _users, bytes32 _terminateToken) {
    for(uint i=0; i<_users.length; i++) {
      users[_users[i]] = true;
    }
    userCount = int256(_users.length);
    terminateToken = _terminateToken;
  }

  function setUsers(address[] memory _users, bool state)  external {
    require(users[msg.sender] || msg.sender == owner, "permission denied");
    int count = 0;
    for(uint i=0; i<_users.length; i++) {
      if (users[_users[i]] != state) {
        count++;
        users[_users[i]] = state;
      }
    }
    userCount = userCount + (state ? count : -count);
  }

  function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    if (!users[user]) return NO_PERMISSIONS;
    if (contentId <= 100) return DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;
    else return READ_BIT | WRITE_BIT | APPEND_BIT;
  }

  function terminate(bytes memory terminateKey) external override {
    require(userCount <= 1, 'cannot terminate when 2 or more users are still active in the group');
    require(keccak256(terminateKey) == terminateToken, "permission denied");
    terminated = true;
  }

}