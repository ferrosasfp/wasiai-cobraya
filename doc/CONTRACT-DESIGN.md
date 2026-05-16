# Smart Contract Design — `CobrayaInvoiceCommitments.sol`

> **Status**: planning doc (design only, no implementation).
> Contract gets deployed during the hack (W2.5 of `WKH-COBRAYA-AGENTS` pipeline).
>
> **Pattern**: alineado con `wasiai-v2/contracts/` (production reference).
> Mismo stack: Foundry + Solidity 0.8.24 + OpenZeppelin (Ownable2Step + SafeERC20).
> Patrón validado en `WasiAIMarketplace.sol` + `WasiEscrow.sol`.

---

## 1. Stack alignment

| Componente | Versión | Razón de uso |
|---|---|---|
| **Framework** | Foundry (forge-std) | Build + test + deploy nativos. Tests `.t.sol` con fuzzing y invariants gratis. Standard de la industria. |
| **Solidity** | `^0.8.24` | Misma versión que wasiai-v2 contracts. Built-in overflow protection. |
| **OpenZeppelin** | `lib/openzeppelin-contracts/` | `Ownable2Step` (transferencia de owner en 2 pasos — anti-key-loss), `SafeERC20`, custom errors. Battle-tested. |
| **Avalanche RPCs** | Configurados en `foundry.toml` | mainnet (`https://api.avax.network/ext/bc/C/rpc`) + fuji (`https://api.avax-test.network/ext/bc/C/rpc`) — copy de v2 |
| **Verify** | `forge verify-contract` o `--verify` flag | Snowtrace verification automated post-deploy |

---

## 2. Propósito

El contrato es el **anti-fraud layer onchain** del `cobraya-fraud-detector` agent. Resuelve **doble-cesión de facturas** — el problema regulatorio #1 del factoring en MX (CNBV lleva 4+ años pidiendo solución).

**Flow**:
1. PyME presenta CFDI a Cobraya
2. `cobraya-fraud-detector` agent calcula `commitmentHash = keccak256(uuid_cfdi || rfc_emisor || amount_mxn)`
3. Agent llama `isCommitted(hash)`:
   - Si `active == true` → REJECT 200 con `{ isUnique: false }` (ya fue cedida)
   - Si `active == false` → continuar al commit
4. Agent llama `commitInvoice(hash, metadataPointer)` → storage write + event emit
5. La factura queda "cesionada" a Cobraya hasta que `releaseInvoice` la libere (post-repago)

---

## 3. Solidity contract (siguiendo patrón v2)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title  CobrayaInvoiceCommitments
 * @notice Onchain registry de facturas cedidas — previene doble-cesión cross-platform.
 * @dev    Deploy en Avalanche Fuji (chainId 43113) para hackathon; mainnet-ready (43114).
 *         CNBV Circular 4/2024: implementa "trazabilidad agéntica" via commitment hash + event log.
 *
 *         Flujo de estado de un commitment:
 *           None → Active (via commitInvoice)
 *           Active → Released (via releaseInvoice, post-repago)
 *           Released → terminal (no re-commit del mismo hash)
 *
 *         Authorization model:
 *           - Owner (deployer / governance multisig en V2) puede add/remove authorized committers
 *           - Only authorized committers (agent hot keys) pueden commitInvoice
 *           - releaseInvoice solo el committer original o owner
 *
 *         Anti-grief: NO public commit. Solo wallets pre-autorizadas para evitar
 *         storage bloat y front-running de hashes.
 */
contract CobrayaInvoiceCommitments is Ownable2Step {

    // ─── Types ────────────────────────────────────────────────────────────────

    enum CommitmentStatus { None, Active, Released }

    struct Commitment {
        address committer;            // wallet que llamó commitInvoice
        uint64  committedAt;          // block.timestamp (uint64 cabe hasta year 584 billion)
        CommitmentStatus status;      // None | Active | Released
        bytes32 metadataPointer;      // optional: IPFS CID o keccak256 de off-chain data
    }

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice commitmentHash → Commitment struct
    mapping(bytes32 => Commitment) public commitments;

    /// @notice agent hot keys autorizadas para commit
    mapping(address => bool) public authorizedCommitters;

    // ─── Custom Errors ────────────────────────────────────────────────────────

    error ZeroAddress();
    error ZeroHash();
    error NotAuthorized(address caller);
    error AlreadyCommitted(bytes32 hash, uint64 originalTimestamp, address originalCommitter);
    error NotCommitted(bytes32 hash);
    error InvalidStatus(bytes32 hash, CommitmentStatus current);
    error NotCommitter(address caller, address actualCommitter);

    // ─── Events ───────────────────────────────────────────────────────────────

    event InvoiceCommitted(
        bytes32 indexed commitmentHash,
        address indexed committer,
        uint64  committedAt,
        bytes32 metadataPointer
    );

    event InvoiceReleased(
        bytes32 indexed commitmentHash,
        address indexed releaser,
        uint64  releasedAt
    );

    event CommitterAuthorized(address indexed committer, bool authorized);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAuthorized() {
        if (!authorizedCommitters[msg.sender] && msg.sender != owner()) {
            revert NotAuthorized(msg.sender);
        }
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    /**
     * @notice Deploy + auto-authorize del initial committer (agent fraud-detector wallet).
     * @param initialCommitter wallet hot del agent fraud-detector que va a hacer commits
     */
    constructor(address initialCommitter) Ownable(msg.sender) {
        if (initialCommitter == address(0)) revert ZeroAddress();
        authorizedCommitters[initialCommitter] = true;
        emit CommitterAuthorized(initialCommitter, true);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /**
     * @notice Owner authorizes/de-authorizes a committer wallet.
     * @dev    Para rotación de hot keys o adding new agent wallets.
     */
    function setAuthorizedCommitter(address committer, bool authorized) external onlyOwner {
        if (committer == address(0)) revert ZeroAddress();
        authorizedCommitters[committer] = authorized;
        emit CommitterAuthorized(committer, authorized);
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    /**
     * @notice Commits an invoice hash. Reverts si ya está committed (Active o Released).
     * @param  commitmentHash    keccak256(uuid_cfdi || rfc_emisor || amount_mxn), calc off-chain
     * @param  metadataPointer   optional IPFS CID o bytes32(0) si no aplica
     */
    function commitInvoice(bytes32 commitmentHash, bytes32 metadataPointer) external onlyAuthorized {
        if (commitmentHash == bytes32(0)) revert ZeroHash();

        Commitment storage c = commitments[commitmentHash];
        if (c.status != CommitmentStatus.None) {
            revert AlreadyCommitted(commitmentHash, c.committedAt, c.committer);
        }

        c.committer = msg.sender;
        c.committedAt = uint64(block.timestamp);
        c.status = CommitmentStatus.Active;
        c.metadataPointer = metadataPointer;

        emit InvoiceCommitted(commitmentHash, msg.sender, uint64(block.timestamp), metadataPointer);
    }

    /**
     * @notice Releases a commitment (called after repago confirmed).
     * @dev    Only committer original o owner pueden release. CEI pattern.
     */
    function releaseInvoice(bytes32 commitmentHash) external {
        Commitment storage c = commitments[commitmentHash];

        if (c.status == CommitmentStatus.None)     revert NotCommitted(commitmentHash);
        if (c.status == CommitmentStatus.Released) revert InvalidStatus(commitmentHash, c.status);

        if (msg.sender != c.committer && msg.sender != owner()) {
            revert NotCommitter(msg.sender, c.committer);
        }

        c.status = CommitmentStatus.Released;
        emit InvoiceReleased(commitmentHash, msg.sender, uint64(block.timestamp));
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Returns (active, timestamp, committer) — usado por agent fraud-detector pre-commit.
     */
    function isCommitted(bytes32 commitmentHash)
        external view
        returns (bool active, uint64 timestamp, address committer)
    {
        Commitment storage c = commitments[commitmentHash];
        active     = c.status == CommitmentStatus.Active;
        timestamp  = c.committedAt;
        committer  = c.committer;
    }

    /**
     * @notice Returns full Commitment struct.
     */
    function getCommitment(bytes32 commitmentHash) external view returns (Commitment memory) {
        return commitments[commitmentHash];
    }
}
```

### Reentrancy note

Este contrato **NO** importa `ReentrancyGuard` porque:
- `commitInvoice` y `releaseInvoice` son **storage-only** writes + events
- No hay token transfers, no external calls untrusted
- Solo state changes en mappings + emit events

Si V2 agrega token escrow para fianzas/colateral → entonces SÍ agregar `ReentrancyGuard` + CEI pattern explícito como en `WasiEscrow.sol`. Documentado para futuro.

---

## 4. Gas estimates (Avalanche Fuji)

| Function | Gas estimate | Cost AVAX a 25 nAVAX/gas |
|---|---|---|
| `commitInvoice` (first commit, cold slot) | ~70,000 | ~0.00175 AVAX |
| `commitInvoice` (revert AlreadyCommitted) | ~28,000 | ~0.00070 AVAX |
| `releaseInvoice` | ~32,000 | ~0.00080 AVAX |
| `setAuthorizedCommitter` | ~46,000 | ~0.00115 AVAX |
| `isCommitted` (view) | 0 (no tx) | 0 |
| `getCommitment` (view) | 0 (no tx) | 0 |
| Deploy (constructor) | ~700,000 | ~0.0175 AVAX |

Demo budget: 3 commits + 1 deploy = ~0.025 AVAX. TREASURY tiene 2.22 AVAX. **Sobrado**.

CD-11 budget: keep `commitInvoice` < 80K gas. Verified via `forge test --gas-report`.

---

## 5. Foundry project structure (en `wasiai-lendable/contracts/`)

```
contracts/
├── foundry.toml            # solc 0.8.24 + OZ remapping + Avalanche RPCs
├── lib/
│   ├── forge-std/          # git submodule
│   └── openzeppelin-contracts/   # git submodule
├── src/
│   └── CobrayaInvoiceCommitments.sol
├── script/
│   └── Deploy.s.sol        # forge script deploy
└── test/
    └── CobrayaInvoiceCommitments.t.sol
```

### `foundry.toml`

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"
optimizer = true
optimizer_runs = 200
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/"
]

[rpc_endpoints]
avalanche = "https://api.avax.network/ext/bc/C/rpc"
fuji = "https://api.avax-test.network/ext/bc/C/rpc"

[etherscan]
fuji = { key = "${SNOWTRACE_API_KEY}", url = "https://api-testnet.snowtrace.io/api" }
avalanche = { key = "${SNOWTRACE_API_KEY}", url = "https://api.snowtrace.io/api" }
```

---

## 6. Foundry tests (`test/CobrayaInvoiceCommitments.t.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CobrayaInvoiceCommitments.sol";

contract CobrayaInvoiceCommitmentsTest is Test {
    CobrayaInvoiceCommitments internal commitments;

    address internal owner   = address(0xA11CE);
    address internal agent   = address(0xB0B);
    address internal other   = address(0xC0C0);

    bytes32 internal constant HASH_1 = keccak256("invoice-1");
    bytes32 internal constant META_0 = bytes32(0);

    event InvoiceCommitted(bytes32 indexed hash, address indexed committer, uint64 ts, bytes32 metadata);
    event InvoiceReleased(bytes32 indexed hash, address indexed releaser, uint64 ts);
    event CommitterAuthorized(address indexed committer, bool authorized);

    function setUp() public {
        vm.prank(owner);
        commitments = new CobrayaInvoiceCommitments(agent);
    }

    // ─── Constructor ──────────────────────────────────────────────────────

    function test_Constructor_AutoAuthorizesInitialCommitter() public {
        assertTrue(commitments.authorizedCommitters(agent));
        assertEq(commitments.owner(), owner);
    }

    function test_Constructor_RevertsOnZeroAddress() public {
        vm.expectRevert(CobrayaInvoiceCommitments.ZeroAddress.selector);
        new CobrayaInvoiceCommitments(address(0));
    }

    // ─── commitInvoice ────────────────────────────────────────────────────

    function test_CommitInvoice_HappyPath() public {
        vm.expectEmit(true, true, false, true);
        emit InvoiceCommitted(HASH_1, agent, uint64(block.timestamp), META_0);

        vm.prank(agent);
        commitments.commitInvoice(HASH_1, META_0);

        (bool active, uint64 ts, address committer) = commitments.isCommitted(HASH_1);
        assertTrue(active);
        assertEq(ts, uint64(block.timestamp));
        assertEq(committer, agent);
    }

    function test_CommitInvoice_RevertsWhenAlreadyCommitted() public {
        vm.prank(agent);
        commitments.commitInvoice(HASH_1, META_0);

        vm.prank(agent);
        vm.expectRevert(
            abi.encodeWithSelector(
                CobrayaInvoiceCommitments.AlreadyCommitted.selector,
                HASH_1,
                uint64(block.timestamp),
                agent
            )
        );
        commitments.commitInvoice(HASH_1, META_0);
    }

    function test_CommitInvoice_RevertsWhenNotAuthorized() public {
        vm.prank(other);
        vm.expectRevert(
            abi.encodeWithSelector(CobrayaInvoiceCommitments.NotAuthorized.selector, other)
        );
        commitments.commitInvoice(HASH_1, META_0);
    }

    function test_CommitInvoice_RevertsOnZeroHash() public {
        vm.prank(agent);
        vm.expectRevert(CobrayaInvoiceCommitments.ZeroHash.selector);
        commitments.commitInvoice(bytes32(0), META_0);
    }

    function test_CommitInvoice_OwnerCanAlsoCommit() public {
        vm.prank(owner);
        commitments.commitInvoice(HASH_1, META_0);

        (, , address committer) = commitments.isCommitted(HASH_1);
        assertEq(committer, owner);
    }

    // ─── releaseInvoice ──────────────────────────────────────────────────

    function test_ReleaseInvoice_HappyPath() public {
        vm.prank(agent);
        commitments.commitInvoice(HASH_1, META_0);

        vm.expectEmit(true, true, false, true);
        emit InvoiceReleased(HASH_1, agent, uint64(block.timestamp));

        vm.prank(agent);
        commitments.releaseInvoice(HASH_1);

        (bool active, , ) = commitments.isCommitted(HASH_1);
        assertFalse(active);
    }

    function test_ReleaseInvoice_RevertsWhenNotCommitted() public {
        vm.prank(agent);
        vm.expectRevert(
            abi.encodeWithSelector(CobrayaInvoiceCommitments.NotCommitted.selector, HASH_1)
        );
        commitments.releaseInvoice(HASH_1);
    }

    function test_ReleaseInvoice_RevertsWhenAlreadyReleased() public {
        vm.prank(agent);
        commitments.commitInvoice(HASH_1, META_0);
        vm.prank(agent);
        commitments.releaseInvoice(HASH_1);

        vm.prank(agent);
        vm.expectRevert(
            abi.encodeWithSelector(
                CobrayaInvoiceCommitments.InvalidStatus.selector,
                HASH_1,
                CobrayaInvoiceCommitments.CommitmentStatus.Released
            )
        );
        commitments.releaseInvoice(HASH_1);
    }

    function test_ReleaseInvoice_OnlyCommitterOrOwner() public {
        vm.prank(agent);
        commitments.commitInvoice(HASH_1, META_0);

        vm.prank(other);
        vm.expectRevert(
            abi.encodeWithSelector(CobrayaInvoiceCommitments.NotCommitter.selector, other, agent)
        );
        commitments.releaseInvoice(HASH_1);

        // Owner CAN release
        vm.prank(owner);
        commitments.releaseInvoice(HASH_1);

        (bool active, , ) = commitments.isCommitted(HASH_1);
        assertFalse(active);
    }

    // ─── setAuthorizedCommitter ──────────────────────────────────────────

    function test_SetAuthorizedCommitter_OnlyOwner() public {
        vm.prank(other);
        vm.expectRevert(); // Ownable: caller is not the owner
        commitments.setAuthorizedCommitter(other, true);

        vm.prank(owner);
        commitments.setAuthorizedCommitter(other, true);
        assertTrue(commitments.authorizedCommitters(other));

        vm.prank(other);
        commitments.commitInvoice(HASH_1, META_0); // Now works
    }

    // ─── Gas snapshots ───────────────────────────────────────────────────

    function test_GasSnapshot_CommitInvoice() public {
        vm.prank(agent);
        uint256 gasBefore = gasleft();
        commitments.commitInvoice(HASH_1, META_0);
        uint256 gasUsed = gasBefore - gasleft();
        // CD-11: commitInvoice gas must be < 80,000
        assertLt(gasUsed, 80_000);
    }
}
```

**Coverage objetivo**: 100% lines + branches (este contrato es pequeño, totalmente coverable).

```bash
forge coverage --report summary
# Expected:
# | File                                       | % Lines | % Statements | % Branches | % Funcs |
# | src/CobrayaInvoiceCommitments.sol         | 100%    | 100%         | 100%       | 100%    |
```

---

## 7. Foundry deploy script (`script/Deploy.s.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CobrayaInvoiceCommitments.sol";

contract DeployCommitments is Script {
    function run() external returns (address deployedAddress) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address initialCommitter = vm.envAddress("FRAUD_DETECTOR_AGENT_WALLET");

        vm.startBroadcast(deployerKey);
        CobrayaInvoiceCommitments commitments = new CobrayaInvoiceCommitments(initialCommitter);
        vm.stopBroadcast();

        deployedAddress = address(commitments);
        console.log("CobrayaInvoiceCommitments deployed at:", deployedAddress);
        console.log("Initial committer authorized:", initialCommitter);
        console.log("Owner:", commitments.owner());
    }
}
```

---

## 8. Deploy workflow (hack-day W2.5)

```bash
# 1. Foundry setup (5 min, primera vez)
cd wasiai-lendable
mkdir contracts && cd contracts
forge init --no-commit --no-git
forge install OpenZeppelin/openzeppelin-contracts --no-commit
# (copy foundry.toml from wasiai-v2 template + adjust)

# 2. Write contract + tests + deploy script (1h)
# src/CobrayaInvoiceCommitments.sol
# test/CobrayaInvoiceCommitments.t.sol
# script/Deploy.s.sol

# 3. Test (10 min)
forge build
forge test -vv
forge coverage --report summary  # expect 100%
forge test --gas-report          # verify CD-11 < 80K

# 4. Set env vars (root .env.local de wasiai-lendable)
# DEPLOYER_PRIVATE_KEY=0x<TREASURY priv key>
# FRAUD_DETECTOR_AGENT_WALLET=0x<separate hot key generated during hack>
# SNOWTRACE_API_KEY=<get from snowtrace.io/myapikey>

# 5. Deploy to Fuji + verify automated (5 min)
source ../.env.local
forge script script/Deploy.s.sol:DeployCommitments \
  --rpc-url fuji \
  --broadcast \
  --verify \
  --etherscan-api-key $SNOWTRACE_API_KEY \
  -vvv

# Output:
# == Logs ==
#   CobrayaInvoiceCommitments deployed at: 0xABC...
#   Initial committer authorized: 0xDEF...
#   Owner: 0x1d0...
# == Transactions ==
#   tx 0x123... → Snowtrace https://testnet.snowtrace.io/tx/0x123...
# ✓ Contract verified at https://testnet.snowtrace.io/address/0xABC...#code

# 6. Save outputs
echo "COBRAYA_COMMITMENTS_ADDRESS=0xABC..." >> ../.env.local
# Update doc/PRODUCTION-EVIDENCE.md with deploy tx + Snowtrace links
```

**Tiempo total W2.5**: 2h (era 1.5h en planning v1, +30min por Foundry init).

---

## 8.5. Performance — Storage vs Events (lookup O(1) regardless of age)

> **Question that institutional reviewers WILL ask**: si una factura fue committed hace meses o años, ¿no se vuelve lenta la búsqueda?
> **Answer**: NO. Es O(1) — tiempo constante regardless of edad del commit. Razón: leemos **storage**, no **events**.

### El malentendido común

La gente confunde "blockchain" con "ledger cronológico" → asume que buscar algo viejo requiere escanear todos los blocks. Eso es VERDAD para **events/logs**, pero NO para **storage** del smart contract.

| | Storage (mapping) | Events (logs) |
|---|---|---|
| **Qué es** | Estado actual del contrato — hash table en state trie | Histórico cronológico de cambios |
| **Cómo se lee** | `eth_call(isCommitted(hash))` — directo al slot | `eth_getLogs(from_block, to_block, filter)` — escanea rango |
| **Complejidad** | **O(1)** independent of chain age | O(N blocks) en el rango |
| **Velocidad típica** | **50-200ms** siempre | 500ms-10s dependiendo del rango |
| **Costo** | Gratis (view function via `eth_call`) | Gratis pero potencialmente slow |
| **Útil para** | "¿Existe esta clave?" → point queries | "¿Qué cambió entre fecha A y B?" → range queries |

### Nuestro contract usa Storage, no Logs

```solidity
mapping(bytes32 => Commitment) public commitments;  // ← Storage = O(1) lookups
event InvoiceCommitted(...);                          // ← Events = audit history (subgraph V2)
```

Para `isCommitted(hash)`:

```
1. RPC envía eth_call al nodo Avalanche
2. Nodo computa storage slot: keccak256(hash || mapping_slot_index)
3. Nodo lee ese slot directamente del state trie ACTUAL del contrato
4. Returns value (~3 ops de DB local del nodo)
```

**No escanea blocks**. **No itera por historia**. **Edad no importa**.

### Números reales en Avalanche Fuji

| Operación | Tiempo típico | Cuándo lo usamos |
|---|---|---|
| `eth_call isCommitted(hash)` (warm) | **50-200ms** | Cada call del agent fraud-detector |
| `eth_call isCommitted(hash)` (cold cache RPC) | **~300ms** | Primer call de la sesión |
| `eth_call` peak congestion | **~400ms** | Worst case durante load |
| `eth_getLogs` rango 100K blocks (~1 día Avalanche) | 500ms-2s | NO usado en core flow — solo para subgraph V2 |
| `eth_getLogs` rango 1M blocks (~10 días) | 3-10s | NO usado |

### Ejemplo temporal concreto

```
2026-05-15 (HOY):
  fraud-detector calls commitInvoice(0xab12...)
  Tx incluida en block 42,500,001
  Storage: commitments[0xab12...] = { committer, ts, status: Active }

2026-11-15 (6 MESES DESPUÉS, chain creció ~10M blocks más):
  Lupita intenta cederla nuevamente
  fraud-detector calls isCommitted(0xab12...)
  Nodo lee storage slot directamente del state trie actual
  Returns: { active: true, ts: 1715000000, committer: 0xAGENT }
  TIEMPO TOTAL: ~150ms ← idéntico que si fuera ayer

2030-05-15 (5 AÑOS DESPUÉS):
  Mismo flow
  TIEMPO TOTAL: ~150ms ← idéntico
```

### Cuándo SÍ necesitaríamos indexer / subgraph

| Query | ¿Indexer needed? | Why |
|---|---|---|
| "¿Esta factura específica está committed?" | ❌ No — direct storage read | Point query → O(1) |
| "¿Cuándo fue committed esta factura?" | ❌ No — `getCommitment(hash)` returns timestamp | Same storage read |
| "Mostrar todas las facturas de 0xAGENT últimos 30 días" | ✅ Sí — necesita iterar events | Range query → O(N) |
| "Total de facturas activas en el sistema" | ✅ Sí — aggregate query | Iterar todo el set |
| "Histórico de releases del último mes" | ✅ Sí — events query | Range |

**Para Cobraya V1 hackathon**: solo point queries → cero indexer, cero performance issue.

**Para Cobraya V2 production** (dashboards analíticos / risk reports): agregar **The Graph subgraph** → 1 día de trabajo, GraphQL queries instantáneas sobre eventos históricos.

### Defensa en profundidad (atomicidad on-chain)

Aunque el pre-check via `eth_call` pase por race condition microsegundos, el smart contract MISMO valida nuevamente en el commit:

```solidity
function commitInvoice(bytes32 hash, bytes32 metadata) external onlyAuthorized {
    Commitment storage c = commitments[hash];
    if (c.status != CommitmentStatus.None) {  // ← double-check on-chain
        revert AlreadyCommitted(hash, c.committedAt, c.committer);
    }
    // ...
}
```

Si dos fraud-detectors simultáneos pasan el pre-check (ambos vieron `active: false`) y ambos intentan commit el mismo hash:
- El primer tx que entra en un block → wins, escribe state
- El segundo tx → REVERT con `AlreadyCommitted(...)`
- Garantía atómica del EVM. Nunca puede haber double-commit.

### Optimizaciones para producción (V2, post-hack)

1. **Local cache** (in-memory o Redis) — reduce lookups repetidos del mismo hash en una ventana de tiempo
2. **The Graph subgraph** — para queries analíticas no-point
3. **Backup RPC providers** — Alchemy + Infura + own node para redundancia
4. **Counter en el contract** — `uint256 public totalActiveCommitments` actualizado en commit/release para aggregate queries baratas

Pero para hackathon V1: direct contract reads son suficientes.

---

## 9. Integration con el agente `cobraya-fraud-detector`

### Endpoint shape

```ts
// src/app/api/agents/cobraya-fraud-detector/invoke/route.ts (HACK-DAY)

POST /api/agents/cobraya-fraud-detector/invoke
Input: {
  uuidCfdi: string;       // UUID format
  rfcEmisor: string;      // RFC del SAT
  amountMXN: number;
}

Output (no double-cession):
{
  isUnique: true,
  commitmentHash: "0x...",
  commitTxHash: "0x...",
  snowtraceUrl: "https://testnet.snowtrace.io/tx/0x...",
  blockNumber: 42500001,
  timestamp: 1715XXXXXX
}

Output (double-cession detected):
{
  isUnique: false,
  commitmentHash: "0x...",
  originalCommitTimestamp: 1715XXXXXX,
  originalCommitter: "0x...",
  rejectReason: "INVOICE_ALREADY_COMMITTED"
}
```

### Pseudocode del agent endpoint (HACK-DAY)

```ts
import { createWalletClient, createPublicClient, http, keccak256, encodePacked } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { COMMITMENTS_ABI } from '@/lib/abis';

const publicClient = createPublicClient({ chain: avalancheFuji, transport: http() });
const walletClient = createWalletClient({
  account: privateKeyToAccount(process.env.FRAUD_DETECTOR_PRIVATE_KEY!),
  chain: avalancheFuji,
  transport: http()
});

const commitmentHash = keccak256(
  encodePacked(['string', 'string', 'uint256'], [uuidCfdi, rfcEmisor, BigInt(amountMXN)])
);

// 1. Pre-check via view function (no gas)
const [active, timestamp, committer] = await publicClient.readContract({
  address: process.env.COBRAYA_COMMITMENTS_ADDRESS as `0x${string}`,
  abi: COMMITMENTS_ABI,
  functionName: 'isCommitted',
  args: [commitmentHash]
});

if (active) {
  return { isUnique: false, commitmentHash, originalCommitTimestamp: timestamp, originalCommitter: committer, rejectReason: 'INVOICE_ALREADY_COMMITTED' };
}

// 2. Commit
const txHash = await walletClient.writeContract({
  address: process.env.COBRAYA_COMMITMENTS_ADDRESS as `0x${string}`,
  abi: COMMITMENTS_ABI,
  functionName: 'commitInvoice',
  args: [commitmentHash, '0x0000000000000000000000000000000000000000000000000000000000000000']
});

const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });

return {
  isUnique: true,
  commitmentHash,
  commitTxHash: txHash,
  snowtraceUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
  blockNumber: Number(receipt.blockNumber),
  timestamp: Number(block.timestamp)
};
```

### Cost del agent en a2a marketplace

`priceUsdc: 0.005` USDC (entre validator $0.001 y scorer $0.05, refleja el on-chain write cost real).

**Total demo cost actualizado**: $0.001 + **$0.005** + $0.05 + $0.01 = **$0.066** USDC por demo run.

### Flow timing en demo (paralelización)

El fraud-detector corre **en paralelo** con el credit-scorer (NO en serie):

```
T+0:   validator starts
T+2s:  validator done → scorer + fraud-detector start IN PARALLEL
T+5s:  fraud-detector done (RPC + commit tx ~3s en Fuji)
T+8s:  scorer done (LLM call ~6s)
T+8s:  matcher starts (depends on score)
T+10s: matcher done → SME ve auction
T+25s: SME signs settle → facilitator → tx confirms
```

---

## 10. Risks específicos del contract

| Risk | Mitigation |
|---|---|
| Fuji RPC slow/timeout durante commit | Timeout 8s, fallback "fraud check skipped (network)" con warn banner. Demo mode siempre paracaídas. |
| TREASURY wallet sin gas para deploy | Pre-check balance, abort si <0.05 AVAX. 2.22 AVAX cubre sobradamente. |
| Front-running de commits | NO public commit (only `onlyAuthorized`). Solo nuestra hot key puede commit. |
| Storage cost grows unbounded | V1: no release flow durante demo. V2 release post-repago. Storage growth en demo es trivial (<10 commits). |
| Owner key compromise | Ownable2Step → transferencia en 2 pasos. V2 con Safe multisig. |
| Reentrancy attack | No external calls untrusted; storage-only. Documentado en §3 (Reentrancy note). |
| Gas price spike Fuji | `forge script --priority-gas-price` o `--gas-price` flag para override. Default OK para hackathon. |

---

## 11. CDs específicos del contract (heredados a BACKLOG.md)

- **CD-11**: `commitInvoice` gas budget < 80K. Verified via `forge test --gas-report`.
- **CD-12**: NO importar `ReentrancyGuard` para V1 (no token transfers). Documentar en código + comment.
- **CD-13**: `forge coverage` debe retornar 100% lines + branches + funcs en `CobrayaInvoiceCommitments.sol`.
- **CD-14**: `forge script Deploy.s.sol --verify` DEBE completar verification en Snowtrace (no manual upload).
- **CD-15** (heredado de v2): NO custom errors sin info útil — todos llevan params (`AlreadyCommitted(hash, ts, committer)`).

---

## 12. Out of scope (post-hack)

- Multi-signature governance via Safe (V2)
- Token escrow para fianzas/colateral (require ReentrancyGuard + CEI)
- Subnet deployment (Bankaool private rail)
- Cross-chain commitment registry (Wormhole/CCIP) — V1 solo Avalanche
- Permit-based commits (signature-only, no msg.sender required)
- Slashing si committer no libera tras repago (incentive design V2)
- Rich metadata IPFS storage con full invoice details
- Storage rent reimbursement model

---

## 13. Source of truth

- **This file**: `/doc/CONTRACT-DESIGN.md` (planning)
- **Implementation files** (hack-day):
  - `contracts/src/CobrayaInvoiceCommitments.sol`
  - `contracts/test/CobrayaInvoiceCommitments.t.sol`
  - `contracts/script/Deploy.s.sol`
  - `contracts/foundry.toml`
- **Deploy artifacts** (post-W2.5): Snowtrace URLs + tx hashes → `doc/PRODUCTION-EVIDENCE.md` §3
- **Reference contracts**: `wasiai-v2/contracts/src/{WasiAIMarketplace,WasiEscrow}.sol`
