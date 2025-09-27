# AlgoVault - Build and Deployment Instructions

## Prerequisites

### Required Software
- **Node.js**: v20.0 or higher
- **npm**: v9.0 or higher
- **AlgoKit**: Latest version
- **Python**: v3.10+ (for AlgoKit)
- **Docker**: Latest version (for LocalNet)

### Installation Commands

```bash
# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install AlgoKit
pipx install algokit

# Verify installations
node --version  # Should be v20+
npm --version   # Should be v9+
algokit --version
```

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Algorand-dApp-Quick-Start-Template-TypeScript

# Install root dependencies
npm install

# Install frontend dependencies
cd QuickStartTemplate/projects/QuickStartTemplate-frontend
npm install

# Install contract dependencies
cd ../QuickStartTemplate-contracts
npm install
```

### 2. Environment Configuration

Create the following environment files:

#### Frontend Environment (.env)
Copy from `.env.template` and configure:

```bash
cd QuickStartTemplate/projects/QuickStartTemplate-frontend
cp .env.template .env
```

**For LocalNet Development:**
```env
# LocalNet configuration
VITE_ENVIRONMENT=local

# Algod
VITE_ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
VITE_ALGOD_SERVER=http://localhost
VITE_ALGOD_PORT=4001
VITE_ALGOD_NETWORK=localnet

# Indexer
VITE_INDEXER_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
VITE_INDEXER_SERVER=http://localhost
VITE_INDEXER_PORT=8980

# KMD (for LocalNet testing)
VITE_KMD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
VITE_KMD_SERVER=http://localhost
VITE_KMD_PORT=4002
VITE_KMD_WALLET="unencrypted-default-wallet"
VITE_KMD_PASSWORD=""

# AI Integration (Optional)
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**For TestNet Deployment:**
```env
# TestNet configuration
VITE_ENVIRONMENT=testnet

# Algod
VITE_ALGOD_TOKEN=""
VITE_ALGOD_SERVER="https://testnet-api.algonode.cloud"
VITE_ALGOD_PORT=""
VITE_ALGOD_NETWORK="testnet"

# Indexer
VITE_INDEXER_TOKEN=""
VITE_INDEXER_SERVER="https://testnet-idx.algonode.cloud"
VITE_INDEXER_PORT=""

# AI Integration (Optional)
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**For MainNet Production:**
```env
# MainNet configuration
VITE_ENVIRONMENT=production

# Algod
VITE_ALGOD_TOKEN=""
VITE_ALGOD_SERVER="https://mainnet-api.algonode.cloud"
VITE_ALGOD_PORT=""
VITE_ALGOD_NETWORK="mainnet"

# Indexer
VITE_INDEXER_TOKEN=""
VITE_INDEXER_SERVER="https://mainnet-idx.algonode.cloud"
VITE_INDEXER_PORT=""

# AI Integration (Optional)
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Development Workflow

### 1. Start LocalNet

```bash
# Start Algorand LocalNet (required for development)
algokit localnet start

# Verify LocalNet is running
algokit localnet status
```

### 2. Build and Deploy Smart Contracts

```bash
# Navigate to contracts directory
cd QuickStartTemplate/projects/QuickStartTemplate-contracts

# Install dependencies (if not done already)
npm install

# Build smart contracts
npm run build

# Deploy to LocalNet
algokit project deploy localnet

# Verify deployment
algokit project list
```

### 3. Generate Contract Clients

```bash
# Navigate to frontend directory
cd ../QuickStartTemplate-frontend

# Generate TypeScript client code for smart contracts
npm run generate:app-clients

# This creates typed contract clients in src/contracts/
```

### 4. Start Frontend Development Server

```bash
# In frontend directory
npm run dev

# Frontend will be available at http://localhost:5173
```

## Build Commands

### Smart Contracts

```bash
cd QuickStartTemplate/projects/QuickStartTemplate-contracts

# Build contracts
npm run build

# Run tests
npm test

# Deploy to different networks
algokit project deploy localnet    # LocalNet
algokit project deploy testnet     # TestNet
algokit project deploy mainnet     # MainNet (production)
```

### Frontend

```bash
cd QuickStartTemplate/projects/QuickStartTemplate-frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run E2E tests
npm run playwright:test
```

## Deployment

### TestNet Deployment

1. **Prepare for TestNet:**
   ```bash
   # Ensure TestNet configuration in .env
   VITE_ENVIRONMENT=testnet
   VITE_ALGOD_SERVER="https://testnet-api.algonode.cloud"
   VITE_ALGOD_NETWORK="testnet"
   ```

2. **Get TestNet Tokens:**
   - Visit [TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
   - Fund your deployment account with ALGO

3. **Deploy Contracts:**
   ```bash
   cd QuickStartTemplate/projects/QuickStartTemplate-contracts
   algokit project deploy testnet
   ```

4. **Build and Deploy Frontend:**
   ```bash
   cd ../QuickStartTemplate-frontend
   npm run build
   
   # Deploy to your hosting service (Vercel, Netlify, etc.)
   # Example for Vercel:
   npx vercel --prod
   ```

### MainNet Deployment

⚠️ **IMPORTANT**: MainNet deployment involves real money. Test thoroughly on TestNet first.

1. **Security Checklist:**
   - [ ] All contracts audited
   - [ ] Comprehensive testing completed
   - [ ] Emergency procedures documented
   - [ ] Backup and recovery plans in place

2. **Deploy Contracts:**
   ```bash
   cd QuickStartTemplate/projects/QuickStartTemplate-contracts
   
   # Update .env for MainNet
   VITE_ENVIRONMENT=production
   VITE_ALGOD_SERVER="https://mainnet-api.algonode.cloud"
   VITE_ALGOD_NETWORK="mainnet"
   
   # Deploy to MainNet
   algokit project deploy mainnet
   ```

3. **Deploy Frontend:**
   ```bash
   cd ../QuickStartTemplate-frontend
   npm run build
   
   # Deploy to production hosting
   # Ensure environment variables are configured in hosting service
   ```

## Troubleshooting

### Common Issues

1. **LocalNet Connection Issues:**
   ```bash
   # Reset LocalNet
   algokit localnet reset
   algokit localnet start
   ```

2. **Contract Deployment Failures:**
   ```bash
   # Check LocalNet status
   algokit localnet status
   
   # Verify account has funds
   algokit goal account list
   ```

3. **Frontend Build Errors:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Regenerate contract clients
   npm run generate:app-clients
   ```

4. **TypeScript Errors:**
   ```bash
   # Check for type issues
   npx tsc --noEmit
   
   # Fix linting issues
   npm run lint:fix
   ```

### Environment-Specific Issues

**LocalNet:**
- Ensure Docker is running
- Check that ports 4001, 4002, 8980 are not in use
- Verify KMD wallet is configured correctly

**TestNet:**
- Ensure you have TestNet ALGO tokens
- Check network connectivity to algonode.cloud
- Verify API endpoints are correct

**MainNet:**
- Double-check all configurations
- Ensure production security measures
- Have emergency response plan ready

## Testing

### Unit Tests
```bash
# Test smart contracts
cd QuickStartTemplate/projects/QuickStartTemplate-contracts
npm test

# Test frontend
cd ../QuickStartTemplate-frontend
npm test
```

### Integration Tests
```bash
# Run E2E tests with Playwright
cd QuickStartTemplate/projects/QuickStartTemplate-frontend
npm run playwright:test
```

### Manual Testing Checklist

**Smart Contracts:**
- [ ] Can deploy contracts successfully
- [ ] Can call contract methods
- [ ] Error handling works correctly
- [ ] Gas costs are reasonable

**Frontend:**
- [ ] Wallet connection works
- [ ] Contract interactions function
- [ ] UI displays correct data
- [ ] Error messages are helpful
- [ ] Responsive design works

**Integration:**
- [ ] Frontend can communicate with contracts
- [ ] Real-time updates work
- [ ] AI features function correctly (if enabled)
- [ ] Performance is acceptable

## Monitoring and Maintenance

### Post-Deployment

1. **Monitor Contract Activity:**
   - Use [AlgoExplorer](https://algoexplorer.io) for transaction monitoring
   - Set up alerts for unusual activity

2. **Frontend Monitoring:**
   - Use application monitoring (Sentry, LogRocket, etc.)
   - Monitor performance metrics
   - Track user analytics

3. **Regular Maintenance:**
   - Update dependencies regularly
   - Monitor security advisories
   - Backup critical data
   - Plan for upgrades

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AlgoVault

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install AlgoKit
      run: pipx install algokit
    
    - name: Install dependencies
      run: |
        npm ci
        cd QuickStartTemplate/projects/QuickStartTemplate-contracts && npm ci
        cd ../QuickStartTemplate-frontend && npm ci
    
    - name: Test contracts
      run: |
        cd QuickStartTemplate/projects/QuickStartTemplate-contracts
        npm test
    
    - name: Test frontend
      run: |
        cd QuickStartTemplate/projects/QuickStartTemplate-frontend
        npm test
    
    - name: Build frontend
      run: |
        cd QuickStartTemplate/projects/QuickStartTemplate-frontend
        npm run build
      env:
        VITE_ENVIRONMENT: testnet
        VITE_ALGOD_SERVER: https://testnet-api.algonode.cloud
        VITE_ALGOD_NETWORK: testnet
        VITE_INDEXER_SERVER: https://testnet-idx.algonode.cloud
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: QuickStartTemplate/projects/QuickStartTemplate-frontend
```

## Support and Resources

### Documentation
- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit-cli)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Community
- [Algorand Discord](https://discord.gg/algorand)
- [Algorand Forum](https://forum.algorand.org/)
- [GitHub Issues](../../issues)

### Emergency Contacts
- Smart Contract Issues: [Create GitHub Issue](../../issues/new)
- Security Concerns: security@yourproject.com
- General Support: support@yourproject.com