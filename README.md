# Merkle Bridge Protocol: Trustless Cross-Chain Transfer

![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?style=for-the-badge&logo=solidity)
![MerkleTree](https://img.shields.io/badge/Cryptography-MerkleTree-red?style=for-the-badge)
![Hardhat](https://img.shields.io/badge/Testing-Hardhat-yellow?style=for-the-badge)

Una implementación de referencia para un **Puente de Tokens (Token Bridge)** utilizando pruebas criptográficas de Merkle (Merkle Proofs) para lograr validación eficiente y sin confianza (trustless) entre cadenas.

## 🏗 Arquitectura del Sistema

El protocolo simula la transferencia de activos entre una **Cadena A (Origen)** y una **Cadena B (Destino)** mediante un mecanismo de *Lock & Mint*.

### 1. The Vault (Origen)
Contrato custodio que bloquea los activos originales. Emite eventos indexados que permiten la reconstrucción del estado off-chain.
* **Función:** `deposit(amount)`
* **Seguridad:** Inmutabilidad de activos bloqueados.

### 2. The Relayer (Off-Chain)
Script de infraestructura que:
1.  Escucha eventos de depósito en la Cadena A.
2.  Genera un **Árbol de Merkle** con todos los depósitos válidos.
3.  Calcula la `Merkle Root` (raíz criptográfica) y la inyecta en la Cadena B.

### 3. The Minter (Destino)
Contrato verificador que libera activos "espejo" (wrapped tokens) solo si se presenta una prueba criptográfica válida.
* **Algoritmo:** Verificación de inclusión $O(\log n)$.
* **Función:** `claim(account, amount, proof)`

## 📐 Criptografía y Matemáticas

La integridad del sistema reside en la verificación de que una "hoja" (transacción) pertenece a la raíz registrada, sin necesidad de que el contrato conozca todas las transacciones.

**Construcción de la Hoja (Leaf):**
$$L = \text{keccak256}(\text{address} || \text{amount})$$

**Verificación de Merkle:**
Dada una raíz $R$ y una prueba $\pi = \{h_1, h_2, ... h_k\}$, el contrato verifica:
$$\text{Verify}(\pi, R, L) \rightarrow \text{true/false}$$

Esto permite validar 1 depósito entre 1 millón utilizando solo 32 bytes de almacenamiento en el contrato.

## 🚀 Instalación y Pruebas

### Prerrequisitos
* Node.js v18+
* Hardhat

### Ejecución
El proyecto incluye un script de simulación integral que despliega ambas cadenas, realiza un depósito, calcula la prueba off-chain y ejecuta el retiro on-chain.

```bash
npm install
npx hardhat test
Salida esperada:

Plaintext
  Mini-Bridge: Prueba de Ingeniería
    --- FASE 1: DESPLIEGUE DE INFRAESTRUCTURA ---
    ✅ Infraestructura lista
    --- FASE 2: DEPÓSITO EN ORIGEN ---
    User1 depositó 50.0 tokens en el Vault
    --- FASE 3: GENERACIÓN DE PRUEBA MATEMÁTICA ---
    Merkle Root Generada: 0xabc123...
    --- FASE 4: RETIRO EN DESTINO ---
    🎉 ¡ÉXITO! El puente funcionó perfectamente.
Autor: Tomás Urquiza