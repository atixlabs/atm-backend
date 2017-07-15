pragma solidity ^0.4.4;
import "zeppelin-solidity/contracts/token/BasicToken.sol";

contract AtmToken is BasicToken {
  string public name = "AtmToken";
  string public symbol = "ATM";
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 10000000;

  function AtmToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}