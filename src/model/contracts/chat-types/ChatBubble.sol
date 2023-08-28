// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../AccessControlledStorage.sol";


abstract contract ChatBubble is AccessControlledStorage {

  uint public chatVersion = 1;

  function terminate(bytes memory terminateKey) external virtual;
  
}