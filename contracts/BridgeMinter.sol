// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BridgeToken.sol"; 
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeMinter is Ownable {
    BridgeToken public token;
    bytes32 public merkleRoot; // La "huella digital" del árbol completo
    
    // Evitamos que alguien cobre dos veces la misma prueba
    mapping(address => bool) public hasClaimed;

    constructor(address _token) Ownable(msg.sender) {
        token = BridgeToken(_token);
    }

    // Tú (como oráculo) actualizas la raíz cuando hay nuevos depósitos
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function claim(address account, uint256 amount, bytes32[] calldata proof) external {
        require(!hasClaimed[account], "Ya reclamado");
        
        // 1. Recreamos la hoja del árbol: Hash(usuario + cantidad)
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        
        // 2. Verificamos matemáticamente que la hoja pertenece a la raíz
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Prueba Invalida");

        hasClaimed[account] = true;
        token.mint(account, amount);
    }
}