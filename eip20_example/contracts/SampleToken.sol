//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.4;
import "./IEIP20.sol";

contract SampleToken is IEIP20 {
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

    function balanceOf(address _owner) public view override returns (uint256) {
        return _balances[_owner];
    }

    function transfer(address _to, uint256 _value) public override returns (bool) {
        require(_balances[msg.sender] >= _value, "Your insufficient not enough");

        _balances[msg.sender] -= _value;
        _balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool) {
        require(_balances[_from] >= _value);
        require(_allowances[_from][msg.sender] >= _value);
        
        _balances[_from] -= _value;
        _balances[_to] += _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public override returns (bool) {
        _allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function allowance(address _owner, address _spender) public view override returns (uint256) {
        return _allowances[_owner][_spender];
    }
}
