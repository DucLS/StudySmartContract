// SPDX-License-Identifiter: MIT

pragma solidity ^0.8.4;

import "./IERC20.sol";

contract SampleToken is IERC20 {
  uint256 private _totalSupply;
  mapping(address => uint256) private _balances;
  mapping(address => mapping(address => uint256)) private _allowances;

  constructor() {
    _totalSupply = 1000000;
    _balances[msg.sender] = 1000000;
  }

  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address _account) public view override returns (uint256) {
    return _balances[_account];
  }

  function transfer(address _to, uint256 _amount) public override returns (bool) {
    require(_balances[msg.sender] >= _amount);

    _balances[msg.sender] -= _amount;
    _balances[_to] += _amount;

    emit Transfer(msg.sender, _to, _amount);

    return true;
  }

  function transferFrom(address _from, address _to, uint256 _amount) public override returns (bool) {
    require(_balances[_from] >= _amount);
    require(_allowances[_from][msg.sender] >= _amount);

    _balances[_from] -= _amount;
    _balances[_to] += _amount;

    emit Transfer(_from, _to, _amount);

    return true;
  }

  function allowance(address _owner, address _spender) public view override returns (uint256) {
    return _allowances[_owner][_spender];
  }

  function approve(address _spender, uint256 _amount) public override returns (bool) {
    _allowances[msg.sender][_spender] = _amount;

    emit Approval(msg.sender, _spender, _amount);

    return true;
  }
}
