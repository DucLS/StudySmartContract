// SPDX-License-Identifiter: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Gold is ERC20, Pausable, AccessControl {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  mapping(address => bool) private _blackList;

  event BlacklistAdded(address _account);
  event BlacklistRemove(address _account);

  constructor() ERC20("GOLD", "GLD") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(PAUSER_ROLE, msg.sender);
    _mint(msg.sender, 1000000 * 10**decimals());
  }

  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override whenNotPaused {
    require(_blackList[from] == false, "Gold: Account sender was on blacklist");
    require(_blackList[to] == false, "Gold: Account recipent was on blacklist");

    super._beforeTokenTransfer(from, to, amount);
  }

  function addToBlackList(address _account) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(_account != msg.sender, "Gold: Can not add sender to blacklist");
    require(_blackList[_account] == false, "Gold: Account was on blacklist");

    _blackList[_account] = true;

    emit BlacklistAdded(_account);
  }

  function removeFromBlackList(address _account) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(_blackList[_account] == true, "Gold: Account was not on blacklist");

    _blackList[_account] = false;

    emit BlacklistRemove(_account);
  }
}
