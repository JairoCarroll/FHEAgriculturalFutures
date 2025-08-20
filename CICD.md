# CI/CD Pipeline Documentation

Complete guide for the Continuous Integration and Continuous Deployment pipeline for the Agricultural Futures Trading Platform.

## Overview

This project uses **GitHub Actions** for automated testing, code quality checks, and deployment workflows. The CI/CD pipeline ensures code quality, test coverage, and successful builds before any code is merged or deployed.

## Table of Contents

- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Code Quality Checks](#code-quality-checks)
- [Testing Strategy](#testing-strategy)
- [Deployment Process](#deployment-process)
- [Secrets Configuration](#secrets-configuration)
- [Troubleshooting](#troubleshooting)

---

## Workflows

### 1. Test Suite Workflow (`test.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint (Code Quality Checks)
- Runs Prettier formatting checks
- Runs Solhint for Solidity code quality
- Runs ESLint (if configured)
- **Node.js Version**: 20.x
- **Runs on**: Ubuntu Latest

#### Test (Multi-Version Testing)
- Tests on Node.js versions: 18.x, 20.x, 22.x
- Compiles contracts
- Runs complete test suite (69 tests)
- Generates coverage report (Node 20.x only)
- Uploads coverage to Codecov
- **Strategy**: Matrix build with fail-fast disabled
- **Runs on**: Ubuntu Latest

#### Gas Report
- Generates gas usage report for all contract functions
- Monitors deployment and function call costs
- **Node.js Version**: 20.x
- **Runs on**: Ubuntu Latest

#### Security Audit
- Runs `npm audit` to check for vulnerable dependencies
- Audit level: Moderate and above
- Continues on error to not block builds
- **Node.js Version**: 20.x
- **Runs on**: Ubuntu Latest

#### Build Check
- Verifies contract compilation succeeds
- Checks artifacts generation
- Depends on lint and test jobs passing
- **Node.js Version**: 20.x
- **Runs on**: Ubuntu Latest

#### All Checks Passed
- Final validation job
- Ensures all required checks succeeded
- Fails if any critical job failed
- **Runs on**: Ubuntu Latest

**Usage:**
```bash
# Automatically triggers on:
git push origin main
git push origin develop

# Or when creating/updating PR:
gh pr create
```

---

### 2. Pull Request Checks (`pr-checks.yml`)

**Triggers:**
- PR opened
- PR synchronized (new commits)
- PR reopened

**Jobs:**

#### PR Validation
- **Title Check**: Validates conventional commits format
  - Format: `type(scope): description`
  - Types: feat, fix, docs, style, refactor, test, chore, perf
  - Examples:
    - ✅ `feat: add market data encryption`
    - ✅ `fix(settlement): resolve timing issue`
    - ✅ `docs: update deployment guide`
    - ❌ `updated contract` (invalid format)

- **Description Check**: Ensures PR has meaningful description (>20 chars)

#### Code Review (Automated)
- Runs all linters
- Checks for TODO/FIXME comments (warns if >10)
- Provides automated code quality feedback

#### Test Coverage Check
- Runs tests with coverage
- Generates coverage report
- Checks coverage thresholds
- Uploads results

#### Contract Size Check
- Verifies compiled contract sizes
- Warns if contracts exceed 24KB (deployment limit)
- Helps prevent deployment issues

#### Changes Summary
- Generates summary of modified files
- Shows commit count
- Lists files changed
- Provides statistics

**Example PR Title Formats:**
```
feat: add encrypted balance withdrawal
feat(trading): implement multi-commodity support
fix: resolve settlement period calculation
fix(access): correct owner validation
docs: update testing documentation
docs(readme): add CI/CD badge
refactor: optimize gas usage in contract creation
test: add edge case coverage for cancellation
chore: update dependencies
```

---

### 3. Deploy Workflow (`deploy.yml`)

**Triggers:**
- Manual workflow dispatch (manual trigger only)

**Inputs:**
- **Network**: Choice of `sepolia` or `localhost`
- **Verify**: Boolean to verify contract on Etherscan (default: true)

**Jobs:**

#### Deploy
- Runs tests before deployment
- Deploys to selected network
- Verifies contract on Etherscan (if selected)
- Uploads deployment artifacts
- Generates deployment summary

**Usage:**
```bash
# Via GitHub UI:
1. Go to Actions tab
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Select network
5. Choose whether to verify
6. Click "Run workflow" button

# Via GitHub CLI:
gh workflow run deploy.yml \
  -f network=sepolia \
  -f verify=true
```

**Artifacts:**
- Deployment info files
- Contract artifacts
- Retention: 30 days

---

## Setup Instructions

### 1. Repository Secrets

Configure the following secrets in GitHub repository settings:

**Required for Sepolia Deployment:**
```
SEPOLIA_RPC_URL          # Alchemy or Infura RPC endpoint
PRIVATE_KEY              # Deployer wallet private key (without 0x)
ETHERSCAN_API_KEY        # For contract verification
```

**Optional for Coverage:**
```
CODECOV_TOKEN            # Codecov.io upload token
```

**How to add secrets:**
1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add name and value
5. Click "Add secret"

### 2. Codecov Integration

#### Step 1: Sign up for Codecov
```bash
# Visit https://codecov.io
# Sign in with GitHub
# Enable repository
```

#### Step 2: Get Upload Token
```bash
# Go to repository settings on Codecov
# Copy the upload token
# Add as CODECOV_TOKEN secret in GitHub
```

#### Step 3: Badge
```markdown
[![codecov](https://codecov.io/gh/username/repository/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repository)
```

### 3. Status Badges

Add to README.md:

```markdown
## CI/CD Status

[![Test Suite](https://github.com/username/repository/workflows/Test%20Suite/badge.svg)](https://github.com/username/repository/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/username/repository/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repository)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## Code Quality Checks

### Solhint Rules

Enforced Solidity code quality rules:

**Error Level:**
- `compiler-version`: Must use ^0.8.0
- `avoid-tx-origin`: No tx.origin usage
- `check-send-result`: Check send() results
- `imports-on-top`: Imports must be at top
- `payable-fallback`: Proper payable fallback
- `state-visibility`: All state vars must have visibility

**Warning Level:**
- `func-visibility`: Function visibility warnings
- `no-empty-blocks`: Warn on empty blocks
- `max-line-length`: Max 120 characters
- `code-complexity`: Max complexity 10
- `function-max-lines`: Max 100 lines per function
- `func-name-mixedcase`: Function naming convention
- `var-name-mixedcase`: Variable naming convention
- `const-name-snakecase`: Constant naming convention
- `private-vars-leading-underscore`: Private var naming
- `max-states-count`: Max 15 state variables
- `reason-string`: Revert reason max 64 chars

**Disabled:**
- `not-rely-on-time`: Allow block.timestamp usage
- `avoid-low-level-calls`: Allow low-level calls
- `no-console`: Allow console in development

### Running Locally

```bash
# Check code quality
npm run lint:sol

# Auto-fix issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

---

## Testing Strategy

### Test Execution

**Multi-Version Testing:**
```yaml
Node.js 18.x  →  Tests run
Node.js 20.x  →  Tests run + Coverage generated
Node.js 22.x  →  Tests run
```

**Test Suite:**
- 69 test cases
- 16 test categories
- ~100% statement coverage
- ~95% branch coverage

### Coverage Thresholds

```yaml
Project Coverage:  ≥ 80%
Patch Coverage:    ≥ 70%
```

### Local Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run test:gas

# Run CI pipeline locally
npm run ci

# Run CI with coverage
npm run ci:coverage
```

---

## Deployment Process

### Manual Deployment (Recommended)

#### Step 1: Pre-deployment Checks
```bash
# Run all tests
npm test

# Check code quality
npm run lint

# Generate gas report
npm run test:gas

# Verify compilation
npm run compile
```

#### Step 2: Deploy via GitHub Actions
```bash
# Go to Actions → Deploy workflow
# Click "Run workflow"
# Select network: sepolia
# Enable verification: true
# Click "Run workflow"
```

#### Step 3: Verify Deployment
```bash
# Check workflow run status
# Download artifacts
# Verify contract on Etherscan
# Update README with contract address
```

### Local Deployment (Development)

```bash
# Start local node
npm run node

# Deploy to local network (separate terminal)
npm run deploy:local

# Interact with local deployment
npm run interact:local
```

### Sepolia Deployment (Testnet)

```bash
# Ensure .env is configured
# SEPOLIA_RPC_URL=your_rpc_url
# PRIVATE_KEY=your_private_key
# ETHERSCAN_API_KEY=your_api_key

# Deploy
npm run deploy

# Verify
npm run verify

# Interact
npm run interact
```

---

## Secrets Configuration

### Required Secrets

#### SEPOLIA_RPC_URL
```
Description: RPC endpoint for Sepolia testnet
Format: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
Get from: https://www.alchemy.com/ or https://infura.io/
```

#### PRIVATE_KEY
```
Description: Private key for deployment wallet
Format: 64 hex characters (without 0x prefix)
Security: NEVER commit this! Use GitHub Secrets only
Get from: MetaMask or other wallet
```

#### ETHERSCAN_API_KEY
```
Description: API key for contract verification
Format: 34 character string
Get from: https://etherscan.io/myapikey
```

#### CODECOV_TOKEN (Optional)
```
Description: Upload token for Codecov
Format: UUID string
Get from: https://codecov.io after enabling repository
```

### Security Best Practices

1. **Never commit secrets to repository**
2. **Use GitHub Secrets for all sensitive data**
3. **Rotate keys periodically**
4. **Use separate keys for testnet and mainnet**
5. **Limit permissions on deployment keys**
6. **Monitor deployment activity**
7. **Enable 2FA on GitHub account**

---

## Troubleshooting

### Common Issues

#### 1. Workflow Fails on Lint

**Problem**: Solhint or Prettier errors

**Solution:**
```bash
# Fix formatting
npm run format

# Fix Solhint issues
npm run lint:fix

# Check remaining issues
npm run lint
```

#### 2. Tests Fail in CI but Pass Locally

**Problem**: Environment differences

**Solution:**
```bash
# Use same Node version as CI (20.x)
nvm use 20

# Clear cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test
```

#### 3. Coverage Upload Fails

**Problem**: Codecov token not set or invalid

**Solution:**
1. Check CODECOV_TOKEN in repository secrets
2. Verify token is correct on Codecov.io
3. Ensure repository is enabled on Codecov
4. Check workflow has correct token reference

#### 4. Deployment Fails

**Problem**: Missing or invalid secrets

**Solution:**
```bash
# Verify secrets are set:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - ETHERSCAN_API_KEY

# Test locally first:
npm run deploy:local

# Check wallet has sufficient balance
```

#### 5. PR Title Validation Fails

**Problem**: Title doesn't follow conventional commits

**Solution:**
```bash
# Use correct format:
type(optional-scope): description

# Valid examples:
feat: add new feature
fix(settlement): resolve bug
docs: update readme

# Update PR title in GitHub UI
```

#### 6. Contract Size Warning

**Problem**: Compiled contract exceeds 24KB

**Solution:**
```bash
# Enable optimizer in hardhat.config.cjs
# Increase runs for better optimization
# Split large contracts into smaller ones
# Remove unused code
```

---

## Workflow Configuration Files

### File Structure
```
.github/
└── workflows/
    ├── test.yml          # Main test suite
    ├── pr-checks.yml     # PR validation
    └── deploy.yml        # Deployment workflow

codecov.yml               # Codecov configuration
.solhint.json            # Solhint rules
.prettierrc              # Prettier configuration
```

### Modifying Workflows

```yaml
# To change Node.js versions:
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add/remove versions

# To change trigger branches:
on:
  push:
    branches:
      - main
      - develop
      - feature/*  # Add new patterns

# To add new jobs:
jobs:
  new-job:
    name: New Job Name
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - # Add your steps
```

---

## Performance Metrics

### Expected Workflow Times

| Workflow | Average Duration |
|----------|------------------|
| Lint Job | ~30 seconds |
| Test (per Node version) | ~2-3 minutes |
| Coverage | ~3-4 minutes |
| Gas Report | ~2-3 minutes |
| Security Audit | ~20 seconds |
| Build Check | ~1-2 minutes |
| **Total (Test Suite)** | **~8-10 minutes** |

### Optimization Tips

1. **Use caching**: npm packages cached automatically
2. **Fail-fast**: Disabled for matrix builds to see all results
3. **Parallel jobs**: Independent jobs run in parallel
4. **Selective triggers**: Only run on relevant branches
5. **Continue-on-error**: For non-critical checks

---

## Best Practices

### For Developers

1. **Run tests locally before pushing**
   ```bash
   npm run ci
   ```

2. **Check code quality before committing**
   ```bash
   npm run lint
   npm run format:check
   ```

3. **Follow conventional commits for PR titles**
   ```
   type(scope): description
   ```

4. **Keep PRs focused and small**
   - Single feature or fix per PR
   - Easy to review and test

5. **Add tests for new features**
   - Maintain coverage above 80%
   - Test edge cases

### For Reviewers

1. **Check CI status before reviewing**
2. **Ensure all checks pass**
3. **Review test coverage changes**
4. **Verify documentation updates**
5. **Check for security issues**

### For Maintainers

1. **Rotate secrets regularly**
2. **Monitor workflow usage and costs**
3. **Update dependencies periodically**
4. **Review and update CI/CD as needed**
5. **Keep documentation current**

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.io/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Summary

This CI/CD pipeline provides:

- ✅ Automated testing on multiple Node.js versions
- ✅ Code quality checks (Solhint, Prettier)
- ✅ Test coverage tracking with Codecov
- ✅ Gas usage monitoring
- ✅ Security audits
- ✅ PR validation with conventional commits
- ✅ Automated deployment workflows
- ✅ Contract size monitoring
- ✅ Comprehensive reporting

**Status**: Production-ready CI/CD pipeline fully configured and documented.
