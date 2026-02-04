import { ethers } from "hardhat";

async function main() {
  console.log("👷‍♂️ Iniciando despliegue del Sistema Bridge...");

  // 1. Desplegar el Token (Simulamos que es el mismo token en ambas cadenas para el demo)
  const BridgeToken = await ethers.getContractFactory("BridgeToken");
  const token = await BridgeToken.deploy();
  await token.waitForDeployment();
  console.log(`✅ Token desplegado en: ${token.target}`);

  // 2. Desplegar el Vault (La caja fuerte)
  const BridgeVault = await ethers.getContractFactory("BridgeVault");
  const vault = await BridgeVault.deploy(token.target);
  await vault.waitForDeployment();
  console.log(`✅ Vault (Origen) desplegado en: ${vault.target}`);

  // 3. Desplegar el Minter (El destino)
  const BridgeMinter = await ethers.getContractFactory("BridgeMinter");
  const minter = await BridgeMinter.deploy(token.target);
  await minter.waitForDeployment();
  console.log(`✅ Minter (Destino) desplegado en: ${minter.target}`);

  // 4. Configuración de Permisos (CRÍTICO)
  // El Minter debe ser dueño del Token para poder imprimir billetes
  console.log("⚙️ Configurando permisos de minteo...");
  await token.transferOwnership(minter.target);
  console.log("🔐 Propiedad del Token transferida al Minter.");

  console.log("🚀 ¡Despliegue completado con éxito!");
  
  // Imprimimos un resumen para copiar y pegar luego
  console.table({
    Token: token.target,
    Vault: vault.target,
    Minter: minter.target,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});