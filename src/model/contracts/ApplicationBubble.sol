// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";


contract ApplicationBubble is AccessControlledStorage {

    address owner = msg.sender;
    address appId;
    address recoveryId;
    bytes32 metadata;
    bool terminated = false;

    constructor(address _appId, address _recoveryId, bytes32 _metadata) {
      appId = _appId;
      recoveryId = _recoveryId;
      metadata = _metadata;
    }

    function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
      if (terminated) return BUBBLE_TERMINATED_BIT;
      if (user != owner && user != appId && user != recoveryId) return NO_PERMISSIONS;
      if (contentId <= 100) return DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;
      else return READ_BIT | WRITE_BIT | APPEND_BIT;
    }

    function getMetadata() external view returns (bytes32) {
      require(msg.sender == owner || msg.sender == appId || msg.sender == recoveryId, "permission denied");
      return metadata;
    }

    function setMetadata(bytes32 _metadata) external {
      require(msg.sender == owner || msg.sender == appId, "permission denied");
      metadata = _metadata;
    }

    function terminate() public {
      require(msg.sender == owner || msg.sender == appId, "permission denied");
      terminated = true;
    }

}