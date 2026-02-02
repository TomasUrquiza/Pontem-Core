// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeToken is ERC20, Ownable {
    constructor() ERC20("Super Bridge Token", "SBT") Ownable(msg.sender) {
        // Nos damos 1 millón de tokens al empezar para probar
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Solo el Bridge podrá llamar a esto para crear dinero en la Cadena B
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Solo el Bridge podrá llamar a esto para destruir dinero al salir
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}