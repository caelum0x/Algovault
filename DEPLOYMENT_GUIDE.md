# AlgoVault Deployment Guide

## 🚀 Complete Deployment Process for AlgoVault

This guide provides detailed instructions for deploying the complete AlgoVault DeFi platform to Algorand networks.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v22.0 or higher
- **npm**: v9.0 or higher
- **AlgoKit**: Latest version
- **Python**: v3.10+ (for AlgoKit)
- **Docker**: Latest version (for LocalNet)
- **Git**: Latest version

### Installation Commands
```bash
# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22

# Install AlgoKit
pipx install algokit

# Verify installations
node --version  # Should be v22+
npm --version   # Should be v9+
algokit --version
```

## 🏗️ Project Setup

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd Algorand-dApp-Quick-Start-Template-TypeScript

# Install root dependencies
npm install

# Install contract dependencies
cd QuickStartTemplate/projects/QuickStartTemplate-contracts
npm install

# Install frontend dependencies
cd ../QuickStartTemplate-frontend
npm install
```

### 2. Environment Configuration
Create the following environment files:

#### Contract Environment
```bash
# In contract directory
cd QuickStartTemplate/projects/QuickStartTemplate-contracts
cp .env.example .env
```

#### Frontend Environment
```bash
# In frontend directory  
cd QuickStartTemplate/projects/QuickStartTemplate-frontend
cp .env.template .env
```

## 🔧 LocalNet Deployment (For Development)

### 1. Start LocalNet
```bash
# Start Algorand LocalNet (required for development)
algokit localnet start

# Verify LocalNet is running
algokit localnet status
```

### 2. Deploy Smart Contracts to LocalNet
```bash
# Navigate to contracts directory
cd QuickStartTemplate/projects/QuickStartTemplate-contracts

# Build smart contracts
npm run build

# Deploy to LocalNet
algokit project deploy localnet

# Verify deployment
algokit project list
```

### 3. Deploy to Specific Network
```bash
# Deploy to specific contract only
algokit project deploy localnet --contract-name vault

# Or run deployment directly
npm run deploy:ci
```

## 🌐 TestNet Deployment

### 1. Prerequisites for TestNet
- **Account with TestNet ALGO**: Fund your deployment account via TestNet dispenser

### 2. Environment Configuration
```bash
# Update .env for TestNet
VITE_ENVIRONMENT=testnet
VITE_ALGOD_SERVER="https://testnet-api.algonode.cloud"
VITE_ALGOD_PORT=""
VITE_INDEXER_SERVER="https://testnet-idx.algonode.cloud"
VITE_INDEXER_PORT=""
```

### 3. Deploy to TestNet
```bash
# Ensure TestNet configuration in .env
# Deploy to TestNet
algokit project deploy testnet
```

## 🏢 MainNet Deployment (Production)

⚠️ **IMPORTANT**: MainNet deployment involves real money. Test thoroughly on TestNet first.

### 1. Security Checklist
- [ ] All contracts audited
- [ ] Comprehensive testing completed
- [ ] Emergency procedures documented
- [ ] Backup and recovery plans in place

### 2. Deploy to MainNet
```bash
# Update .env for MainNet
VITE_ENVIRONMENT=production
VITE_ALGOD_SERVER="https://mainnet-api.algonode.cloud"
VITE_ALGOD_NETWORK="mainnet"

# Deploy to MainNet
algokit project deploy mainnet
```

## 🏗️ Architecture Overview

### Smart Contracts Deployed
1. **StakingPool**: Core staking functionality
2. **RewardDistributor**: Automated reward distribution system
3. **GovernanceVault**: Decentralized governance mechanisms
4. **AutoCompounder**: Automated yield compounding
5. **VaultFactory**: Factory for creating new vaults
6. **Security Contracts**: Emergency pause and access control
7. **Math Contracts**: Yield calculations and compound math

### Frontend Integration
- Generated contract clients in `/src/contracts`
- All components properly configured
- AI integration ready
- Wallet integration functional

## 🚀 Running the Application

### 1. Start Frontend Development Server
```bash
# Navigate to frontend
cd QuickStartTemplate/projects/QuickStartTemplate-frontend

# Install dependencies if not done already
npm install

# Start development server
npm run dev
```

### 2. Frontend Build for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### Contract Testing
```bash
# Run smart contract tests
npm run test

# Run with coverage
npm run test -- --coverage
```

### Frontend Testing
```bash
# Run frontend tests
npm run test

# Run E2E tests
npm run playwright:test
```

## 🛠️ Build Commands

### Smart Contracts
```bash
# Build contracts
npm run build

# Generate client code
algokit generate client smart_contracts/artifacts --output {app_spec_dir}/{contract_name}Client.ts

# Type checking
npm run check-types
```

## 🔐 Security Features

### Emergency Controls
- Emergency pause mechanisms
- Access control systems
- Circuit breakers for critical operations

### Audit-Ready Code
- Comprehensive parameter validation
- Mathematical overflow protection
- Role-based permissions

## 📊 AI Integration

### AI Features Available
- Yield prediction using LLMs
- Portfolio optimization recommendations
- Risk assessment and analysis
- Real-time DeFi chat assistant

### API Configuration
- Groq API integration
- OpenRouter API support
- Configurable AI providers

## 🏅 Hackathon Submission Ready

### Complete Features
- ✅ Full DeFi yield farming platform
- ✅ AI-powered insights and analytics
- ✅ Professional UI/UX
- ✅ Comprehensive documentation
- ✅ Ready for deployment

### Competitive Advantages
1. **Innovation**: Unique AI + DeFi combination
2. **Technical Complexity**: Sophisticated architecture
3. **User Experience**: Professional interface
4. **Market Relevance**: Addresses real DeFi challenges

## 🔁 Troubleshooting

### Common Issues

1. **LocalNet Connection Issues**:
   ```bash
   # Reset LocalNet
   algokit localnet reset
   algokit localnet start
   ```

2. **Contract Deployment Failures**:
   ```bash
   # Check LocalNet status
   algokit localnet status
   
   # Verify account has funds
   algokit goal account list
   ```

3. **Frontend Build Errors**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Regenerate contract clients
   npm run build
   ```

4. **TypeScript Errors**:
   ```bash
   # Check for type issues
   npm run check-types
   ```

### Network-Specific Issues

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

## 📈 Post-Deployment Monitoring

### 1. Contract Monitoring
- Use AlgoExplorer for transaction monitoring
- Set up alerts for unusual activity
- Monitor gas usage and costs

### 2. Frontend Monitoring
- Application monitoring (Sentry, LogRocket, etc.)
- Performance metrics tracking
- User analytics

### 3. Regular Maintenance
- Update dependencies regularly
- Monitor security advisories
- Backup critical data
- Plan for upgrades

## 🤝 Contributing

### Development Workflow
1. Fork the repository and create feature branch
2. Implement changes with comprehensive testing
3. Update documentation and examples
4. Submit pull request with detailed description

### Code Standards
- Strict TypeScript typing with comprehensive interfaces
- Unit tests for all smart contract functions
- Inline comments and external documentation
- Security best practices

## 📄 License

MIT License - Open source and community-friendly.

---

## 🎯 Ready for Deployment

The AlgoVault platform is fully prepared for deployment to any Algorand network. All smart contracts are compiled, TypeScript clients are generated, and frontend is configured for multiple environments.

When LocalNet is running, execute: `algokit project deploy localnet` to deploy the complete suite of contracts.