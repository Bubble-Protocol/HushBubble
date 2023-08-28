// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../..AccessControlledStorage.sol";
import "../..AccessControlBits.sol";


contract ProfileRegistry is AccessControlledStorage {

  address owner = msg.sender;

  function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
    if (uint256(uint160(user)) == contentId) return RWA_BITS;
    if (user == owner && contentId == 0) return RWA_BITS;
    if (contentId == 0) return NO_PERMISSIONS;
    return READ_BIT;
  }

}