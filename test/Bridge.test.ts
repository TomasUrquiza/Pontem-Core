import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("Mini-Bridge: Prueba de Ingeniería", function () {
  it("Debe transferir tokens de Chain A a Chain B usando Merkle Proofs", async function () {
    // 1. Setup: Obtenemos las cuentas (Simulamos usuarios)
    const [admin, user1] = await ethers.getSigners();

    console.log("--- FASE 1: DESPLIEGUE DE INFRAESTRUCTURA ---");
    
    // Desplegamos Token A (Original) y Token B (Representación en destino)
    const BridgeToken = await ethers.getContractFactory("BridgeToken");
    const tokenA = await BridgeToken.deploy(); 
    const tokenB = await BridgeToken.deploy(); 
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    // Desplegamos Vault (En Chain A)
    const BridgeVault = await ethers.getContractFactory("BridgeVault");
    const vault = await BridgeVault.deploy(tokenA.target);
    await vault.waitForDeployment();

    // Desplegamos Minter (En Chain B)
    const BridgeMinter = await ethers.getContractFactory("BridgeMinter");
    const minter = await BridgeMinter.deploy(tokenB.target);
    await minter.waitForDeployment();

    // CRÍTICO: Le damos permiso al Minter para imprimir dinero en Chain B
    // Transferimos la propiedad (Ownership) del Token B al contrato Minter
    await tokenB.transferOwnership(minter.target);

    console.log("✅ Infraestructura lista");

    // 2. Preparación del Usuario
    const amountToBridge = ethers.parseEther("50");
    // Le damos dinero inicial al usuario en Chain A
    await tokenA.transfer(user1.address, amountToBridge);
    
    // 3. ACCIÓN: El usuario deposita en el Vault (Chain A)
    console.log("\n--- FASE 2: DEPÓSITO EN ORIGEN ---");
    await tokenA.connect(user1).approve(vault.target, amountToBridge);
    await vault.connect(user1).deposit(amountToBridge);
    console.log(`User1 depositó ${ethers.formatEther(amountToBridge)} tokens en el Vault`);

    // 4. INGENIERÍA OFF-CHAIN (Lo que hace el servidor)
    console.log("\n--- FASE 3: GENERACIÓN DE PRUEBA MATEMÁTICA (OFF-CHAIN) ---");
    
    // Simulamos la lista de depósitos (En realidad leeríamos eventos)
    const deposits = [
      { account: user1.address, amount: amountToBridge },
      // Aquí podríamos agregar más usuarios simulados para hacer el árbol más grande
    ];

    // PASO CLAVE: Hashing de los datos (Igual que en Solidity: keccak256(abi.encodePacked(...)))
    const leaves = deposits.map(d => 
      ethers.solidityPackedKeccak256(["address", "uint256"], [d.account, d.amount])
    );

    // Construimos el Árbol de Merkle
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot(); // La raíz que resume TODOS los depósitos

    console.log("Merkle Root Generada:", root);

    // 5. Sincronización: El Admin actualiza la raíz en el Minter (Chain B)
    await minter.setMerkleRoot(root);

    // 6. ACCIÓN: El usuario reclama en Chain B presentando su prueba
    console.log("\n--- FASE 4: RETIRO EN DESTINO ---");
    
    // Obtenemos la prueba específica para User1 (La "rama" del árbol)
    const leaf = leaves[0];
    const proof = tree.getHexProof(leaf);

    // Ejecutamos el reclamo on-chain
    await minter.claim(user1.address, amountToBridge, proof);

    // 7. Verificación Final
    const balanceB = await tokenB.balanceOf(user1.address);
    console.log(`Balance de User1 en Chain B: ${ethers.formatEther(balanceB)} SBT`);
    
    expect(balanceB).to.equal(amountToBridge);
    console.log("🎉 ¡ÉXITO! El puente funcionó perfectamente.");
  });
});