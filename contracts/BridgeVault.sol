// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BridgeVault {
    IERC20 public token;

    // Este evento es CRÍTICO: contiene los datos que usaremos para el Árbol de Merkle
    event Deposit(address indexed depositor, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function deposit(uint256 amount) external {
        // El usuario debe aprobar antes (approve)
        token.transferFrom(msg.sender, address(this), amount);
        
        // "Gritamos" a la red que hubo un depósito
        emit Deposit(msg.sender, amount);
    }
}