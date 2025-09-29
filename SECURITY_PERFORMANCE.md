# Security Auditing & Performance Optimization Guide

Comprehensive guide for security auditing and performance optimization in the Agricultural Futures Trading Platform.

## Table of Contents

- [Security Auditing](#security-auditing)
- [Performance Optimization](#performance-optimization)
- [Toolchain Integration](#toolchain-integration)
- [Gas Optimization](#gas-optimization)
- [DoS Protection](#dos-protection)
- [Code Quality](#code-quality)
- [Pre-commit Hooks](#pre-commit-hooks)
- [CI/CD Security](#cicd-security)

---

## Security Auditing

### Security Toolchain

```
Solidity Contract Security
├── Solhint (Static Analysis)
├── Slither (Advanced Analysis)
├── Mythril (Symbolic Execution)
└── Manual Review

JavaScript/TypeScript Security
├── ESLint (Code Quality)
├── npm audit (Dependency Security)
└── SonarQube (Code Smell Detection)

CI/CD Security
├── GitHub Actions Security Scanning
├── Dependency Review
└── SAST/DAST Tools
```

### 1. Solhint Configuration (`.solhint.json`)

**20+ Security Rules Enabled:**

#### Error-Level Rules (Critical)
```json
{
  "avoid-tx-origin": "error",        // Prevents phishing attacks
  "check-send-result": "error",      // Ensures send() results checked
  "payable-fallback": "error",       // Proper payable fallback
  "state-visibility": "error",       // All state vars visible
  "imports-on-top": "error"          // Prevents import confusion
}
```

#### Warning-Level Rules (Best Practices)
```json
{
  "no-empty-blocks": "warn",              // Prevents accidental empty blocks
  "code-complexity": ["warn", 10],        // Limits cyclomatic complexity
  "function-max-lines": ["warn", 100],    // Limits function size
  "max-states-count": ["warn", 15],       // Limits state variables
  "reason-string": ["warn", {"maxLength": 64}]  // Revert reason limits
}
```

### 2. Common Vulnerabilities Prevented

#### Reentrancy Protection
```solidity
// Pattern: Check-Effects-Interactions
function withdraw() external {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;  // Effect before interaction
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

#### Integer Overflow/Underflow
```solidity
// Solidity 0.8.x has built-in overflow protection
// No need for SafeMath
uint256 total = quantity * price;  // Safe in 0.8+
```

#### Access Control
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}
```

#### DoS with Block Gas Limit
```solidity
// Avoid unbounded loops
// Use pagination or mapping instead
mapping(address => uint256[]) public contracts;
function getContractsPaginated(uint256 offset, uint256 limit)
    external view returns (uint256[] memory);
```

### 3. Security Audit Checklist

#### Pre-Deployment Checklist
- [ ] All compiler warnings resolved
- [ ] Solhint passes with no errors
- [ ] No hardcoded private keys or secrets
- [ ] Access control properly implemented
- [ ] Emergency pause mechanism tested
- [ ] Reentrancy guards in place
- [ ] Integer overflow protection (0.8+)
- [ ] External calls handled safely
- [ ] Events emitted for state changes
- [ ] Gas limits considered
- [ ] Test coverage > 80%
- [ ] Security audit performed

### 4. Manual Security Review Process

#### Step 1: Code Review
```bash
# Check for security issues
npm run lint:sol

# Review critical functions
# - Fund transfers
# - Access control
# - State modifications
```

#### Step 2: Testing
```bash
# Run full test suite
npm test

# Check coverage
npm run test:coverage

# Gas profiling
npm run test:gas
```

#### Step 3: External Audit (Recommended)
- Hire professional security auditors
- Submit to audit platforms (OpenZeppelin, Trail of Bits)
- Bug bounty programs

---

## Performance Optimization

### Performance Toolchain

```
Contract Optimization
├── Solidity Optimizer (Hardhat)
├── Gas Reporter
├── Storage Layout Optimization
└── Function Selector Optimization

Testing Performance
├── Gas Profiling
├── Coverage Analysis
└── Benchmark Tests

CI/CD Performance
├── Build Time Optimization
├── Parallel Testing
└── Caching Strategies
```

### 1. Solidity Optimizer Configuration

**hardhat.config.cjs:**
```javascript
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,  // Balance between deployment and runtime
    },
    evmVersion: "cancun",
  },
}
```

**Optimizer Runs Guide:**
- `runs: 1` - Minimum deployment cost, higher runtime cost
- `runs: 200` - **Balanced (recommended for most contracts)**
- `runs: 1000` - Lower runtime cost, higher deployment cost
- `runs: 10000` - Minimum runtime cost, maximum deployment cost

### 2. Gas Optimization Techniques

#### Storage Optimization
```solidity
// ❌ Bad: Each variable uses full slot (32 bytes)
uint256 a;
uint128 b;
uint128 c;

// ✅ Good: Pack variables in same slot
uint128 b;
uint128 c;  // Both fit in one slot
uint256 a;

// Saves ~20,000 gas per SSTORE
```

#### Memory vs Storage
```solidity
// ❌ Bad: Unnecessary storage access
for (uint i = 0; i < myArray.length; i++) {  // SLOAD each iteration
    // process myArray[i]
}

// ✅ Good: Cache in memory
uint256 len = myArray.length;  // Single SLOAD
for (uint i = 0; i < len; i++) {
    // process myArray[i]
}
```

#### Function Optimization
```solidity
// ❌ Bad: Public visibility for internal use
function _helperFunction() public pure returns (uint256) {}

// ✅ Good: Use appropriate visibility
function _helperFunction() private pure returns (uint256) {}

// External is cheaper than public for external calls
function processData(uint256[] calldata data) external {}
```

#### Event Optimization
```solidity
// Events are cheaper than storage
// Use indexed parameters for filtering (max 3)
event ContractCreated(
    uint32 indexed contractId,
    address indexed buyer,
    address indexed seller,
    uint8 cropType  // Non-indexed for cheap storage
);
```

### 3. Gas Profiling

**Enable gas reporting:**
```bash
# One-time run
REPORT_GAS=true npm test

# Persistent (set in .env)
REPORT_GAS=true
npm run test:gas
```

**Sample Output:**
```
·-----------------------------------------|----------------------------|-------------|
|  Solc version: 0.8.24                   ·  Optimizer enabled: true   ·  Runs: 200  │
··········································|····························|·············|
|  Methods                                                                           │
·············|····························|·············|··············|·············|
|  Contract  ·  Method                    ·  Min        ·  Max         ·  Avg        │
·············|····························|·············|··············|·············|
|  Contract  ·  createFuturesContract     ·  245123     ·  252431      ·  248777     │
|  Contract  ·  confirmContract           ·  78234      ·  85123       ·  81678      │
|  Contract  ·  settleContract            ·  115234     ·  122456      ·  118845     │
·············|····························|·············|··············|·············|
```

### 4. Performance Benchmarks

**Target Gas Costs:**

| Operation | Target Gas | Acceptable | Warning |
|-----------|-----------|------------|---------|
| Deploy | < 2.5M | < 3M | > 3M |
| Create Contract | < 250k | < 300k | > 300k |
| Confirm | < 80k | < 100k | > 100k |
| Settle | < 120k | < 150k | > 150k |
| Cancel | < 90k | < 120k | > 120k |

**Test Execution:**
- Unit tests: < 10 seconds
- Full suite: < 2 minutes
- Coverage: < 5 minutes

---

## Toolchain Integration

### Complete Toolstack

```
┌─────────────────────────────────────────────────────────┐
│                    Development Layer                      │
├─────────────────────────────────────────────────────────┤
│  Hardhat + Solhint + ESLint + Prettier                   │
│  Gas Reporter + Coverage + TypeChain                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Quality Assurance Layer                 │
├─────────────────────────────────────────────────────────┤
│  Pre-commit: Lint + Format + Security Check               │
│  Pre-push: Compile + Test + Gas Check                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     CI/CD Layer                           │
├─────────────────────────────────────────────────────────┤
│  GitHub Actions: Test + Coverage + Security + Deploy      │
│  Codecov: Coverage Tracking                               │
└─────────────────────────────────────────────────────────┘
```

### 1. Local Development Workflow

```bash
# Initial Setup
npm install
npm run prepare  # Install Husky hooks

# Development Cycle
npm run compile          # Compile contracts
npm test                 # Run tests
npm run test:coverage    # Check coverage
npm run test:gas         # Profile gas

# Code Quality
npm run lint             # Check all code
npm run lint:fix         # Auto-fix issues
npm run format           # Format code
npm run format:check     # Check formatting

# Pre-commit (automatic via Husky)
# - Lints changed files
# - Formats code
# - Runs security audit

# Pre-push (automatic via Husky)
# - Compiles contracts
# - Runs all tests
# - Checks gas usage
```

### 2. Git Hooks with Husky

**Pre-commit Hook** (`.husky/pre-commit`):
```bash
#!/usr/bin/env sh
🔍 Running pre-commit checks...
npx lint-staged
🔒 Running security audit...
npm audit --audit-level=moderate
✅ Pre-commit checks completed
```

**Pre-push Hook** (`.husky/pre-push`):
```bash
#!/usr/bin/env sh
🧪 Running pre-push checks...
📦 Compiling contracts...
🧪 Running tests...
⛽ Checking gas usage...
✅ Pre-push checks passed!
```

**Lint-staged Configuration**:
```json
{
  "lint-staged": {
    "*.sol": ["solhint --fix", "prettier --write"],
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

### 3. CI/CD Integration

**Automated Checks:**
- ✅ Lint (Solhint + ESLint + Prettier)
- ✅ Test (Multi-version Node.js)
- ✅ Coverage (Codecov upload)
- ✅ Gas Report (Performance monitoring)
- ✅ Security Audit (npm audit)
- ✅ Build Verification
- ✅ Contract Size Check

**Workflow Triggers:**
- Push to main/develop
- Pull requests
- Manual deployment

---

## Gas Optimization

### Gas Monitoring Strategy

```
Development
├── Local Testing (REPORT_GAS=true)
├── Pre-commit Checks
└── Pre-push Gas Profiling

CI/CD
├── Automated Gas Reports
├── Performance Regression Detection
└── Historical Gas Tracking

Production
├── Real Transaction Monitoring
├── Gas Price Optimization
└── Contract Upgrade Planning
```

### 1. Gas Reporter Configuration

**hardhat.config.cjs:**
```javascript
gasReporter: {
  enabled: process.env.REPORT_GAS === "true",
  currency: "USD",
  coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  outputFile: "gas-report.txt",
  noColors: true,
}
```

### 2. Gas Optimization Checklist

#### Deployment Gas
- [ ] Optimizer enabled with appropriate runs
- [ ] Minimize constructor code
- [ ] Remove unused code
- [ ] Use libraries for common functions

#### Runtime Gas
- [ ] Pack storage variables
- [ ] Cache storage reads
- [ ] Use `calldata` instead of `memory` for external functions
- [ ] Minimize external calls
- [ ] Batch operations when possible
- [ ] Use events instead of storage

#### Function Gas
- [ ] Appropriate visibility (external < public)
- [ ] Short-circuit conditions
- [ ] Avoid loops over unbounded arrays
- [ ] Use mappings instead of arrays when possible

---

## DoS Protection

### Protection Mechanisms

```
DoS Prevention Strategy
├── Gas Limits
│   ├── Per-transaction limits
│   └── Function complexity limits
├── Rate Limiting
│   ├── Per-address limits
│   └── Per-block limits
├── Pull Payment Pattern
│   ├── User-initiated withdrawals
│   └── Avoid push-based distributions
└── Emergency Pause
    ├── Owner-controlled pause
    └── Gradual recovery mechanisms
```

### 1. Gas Limit Protection

```solidity
// Maximum gas per transaction
uint256 constant MAX_GAS = 8000000;

// Limit loop iterations
uint256 constant MAX_BATCH_SIZE = 100;

function processMultiple(uint256[] calldata ids) external {
    require(ids.length <= MAX_BATCH_SIZE, "Batch too large");
    for (uint i = 0; i < ids.length; i++) {
        process(ids[i]);
    }
}
```

### 2. Pull Payment Pattern

```solidity
// ❌ Bad: Push payments (DoS vector)
function distributeRewards(address[] memory users) external {
    for (uint i = 0; i < users.length; i++) {
        users[i].transfer(rewards[users[i]]);  // Can fail and block
    }
}

// ✅ Good: Pull payment pattern
mapping(address => uint256) public pendingRewards;

function claimRewards() external {
    uint256 amount = pendingRewards[msg.sender];
    pendingRewards[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
}
```

### 3. Emergency Pause

```solidity
bool public paused;

modifier whenNotPaused() {
    require(!paused, "Contract paused");
    _;
}

function pause() external onlyOwner {
    paused = true;
}

function unpause() external onlyOwner {
    paused = false;
}
```

---

## Code Quality

### Quality Metrics

```
Code Quality Score
├── Linting: Solhint + ESLint (20+ rules each)
├── Formatting: Prettier (strict)
├── Coverage: > 80% target
├── Complexity: < 10 per function
└── Documentation: Inline + External
```

### 1. ESLint Configuration

**JavaScript/TypeScript Rules:**
- Error prevention
- Best practices enforcement
- ES6+ features
- Security patterns
- Code consistency

### 2. Prettier Configuration

**Consistent Formatting:**
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5"
}
```

### 3. Code Splitting

**Benefits:**
- Reduced attack surface
- Faster load times
- Better maintainability
- Easier testing

**Implementation:**
```
contracts/
├── core/
│   ├── Contract.sol
│   └── Storage.sol
├── interfaces/
│   └── IContract.sol
├── libraries/
│   └── Utils.sol
└── security/
    └── AccessControl.sol
```

---

## Pre-commit Hooks

### Hook Configuration

**Automatic Checks on Commit:**
1. **Lint-staged** - Format and lint changed files
2. **Security Audit** - Check for vulnerabilities
3. **Type Checking** - Verify types (if TypeScript)

**Benefits:**
- Catch issues early ("shift-left" strategy)
- Consistent code quality
- Reduced review time
- Automated enforcement

### Setup

```bash
# Install Husky
npm install --save-dev husky

# Initialize hooks
npm run prepare

# Hooks automatically run on commit/push
```

---

## CI/CD Security

### Security Pipeline

```
Code Commit
    ↓
Pre-commit Hooks (Local)
    ↓
GitHub Actions Trigger
    ↓
┌─────────────────────┐
│  Security Checks    │
├─────────────────────┤
│  • Solhint          │
│  • npm audit        │
│  • Dependency check │
│  • Secret scan      │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Quality Checks     │
├─────────────────────┤
│  • ESLint           │
│  • Prettier         │
│  • Test coverage    │
│  • Gas profiling    │
└─────────────────────┘
    ↓
All Checks Pass?
    ↓ Yes
Merge/Deploy Allowed
```

### Automated Security Checks

**GitHub Actions:**
- Static analysis
- Dependency scanning
- Secret detection
- Contract size limits
- Gas usage monitoring

---

## Best Practices Summary

### Security
✅ Use Solhint for static analysis
✅ Run npm audit regularly
✅ Implement access control
✅ Add reentrancy guards
✅ Use pull payment pattern
✅ Enable emergency pause
✅ Audit before deployment

### Performance
✅ Enable Solidity optimizer
✅ Profile gas usage
✅ Pack storage variables
✅ Cache storage reads
✅ Use appropriate visibility
✅ Minimize external calls
✅ Monitor gas costs

### Code Quality
✅ Configure ESLint + Solhint
✅ Use Prettier for formatting
✅ Maintain > 80% coverage
✅ Keep functions < 100 lines
✅ Limit complexity < 10
✅ Document all code
✅ Review before merge

### Automation
✅ Pre-commit hooks (Husky)
✅ Lint-staged integration
✅ CI/CD pipelines
✅ Automated testing
✅ Coverage tracking
✅ Gas monitoring
✅ Security scanning

---

## Quick Reference

### Security Commands
```bash
npm run lint:sol         # Solidity security check
npm audit                # Dependency vulnerabilities
npm run test:coverage    # Test coverage
```

### Performance Commands
```bash
npm run test:gas         # Gas profiling
npm run compile          # With optimizer
npm run ci              # Full pipeline
```

### Quality Commands
```bash
npm run lint            # All linting
npm run lint:fix        # Auto-fix issues
npm run format          # Format all code
npm run format:check    # Check formatting
```

---

## Resources

- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Gas Optimization Patterns](https://github.com/iskdrews/awesome-solidity-gas-optimization)
- [Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Husky Documentation](https://typicode.github.io/husky/)

---

**Status**: ✅ Complete toolchain integration with security and performance optimization
