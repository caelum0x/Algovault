import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  AiOutlineLineChart,
  AiOutlineWallet,
  AiOutlineSetting,
  AiOutlineGift,
  AiOutlineIe,
  AiOutlineWarning,
  AiOutlineRobot,
  AiOutlineBulb,
  AiOutlineSend,
  AiOutlineStar,
  AiOutlineDeploymentUnit,
  AiOutlineTool,
} from 'react-icons/ai'
import { BsCoin, BsGraphUp, BsPieChart, BsRobot, BsArrowUpRightCircle } from 'react-icons/bs'

// Import our new components
import ConnectWallet from './components/ConnectWallet'
import StakingInterface from './components/vault/StakingInterface'
import PoolOverview from './components/vault/PoolOverview'
import RewardTracker from './components/vault/RewardTracker'
import ProposalList from './components/governance/ProposalList'
import CreateProposalModal from './components/governance/CreateProposalModal'
import TVLDashboard from './components/analytics/TVLDashboard'

// Import demo components (now part of AlgoVault tools)
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'
import AppCalls from './components/AppCalls'

// Import AI components
import AIYieldPredictor from './components/ai/AIYieldPredictor'
import AIPortfolioOptimizer from './components/ai/AIPortfolioOptimizer'
import AIChatAssistant from './components/ai/AIChatAssistant'
import AIRiskAssessment from './components/ai/AIRiskAssessment'
import AISetupGuide from './components/ai/AISetupGuide'
import AIHeader from './components/ai/AIHeader'
import AIFloatingActions from './components/ai/AIFloatingActions'

// Import hooks and contexts
import { useStakingPool } from './hooks/useStakingPool'
import { useGovernance } from './hooks/useGovernance'
import { useAI } from './contexts/AIContext'

interface VaultDashboardProps {}

const VaultDashboard: React.FC<VaultDashboardProps> = () => {
  const { activeAddress } = useWallet()
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openCreateProposalModal, setOpenCreateProposalModal] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'vault' | 'governance' | 'analytics' | 'ai' | 'tools'>('vault')
  const [selectedPool] = useState<string>('pool-1') // Default pool
  const [aiChatOpen, setAIChatOpen] = useState(false)
  const [aiChatMinimized, setAIChatMinimized] = useState(false)
  const [aiSetupOpen, setAISetupOpen] = useState(false)

  // AI context
  const { isAIEnabled, showSetupGuide, setShowSetupGuide } = useAI()

  // Tool modals
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)
  const [openTokenModal, setOpenTokenModal] = useState<boolean>(false)
  const [openAppCallsModal, setOpenAppCallsModal] = useState<boolean>(false)

  // Hooks for data
  const { poolData, userStake, loading: stakingLoading, claimRewards, claiming } = useStakingPool(selectedPool)

  const { proposals, userVotingPower, governanceStats } = useGovernance()

  // Handle AI setup guide
  useEffect(() => {
    if (showSetupGuide) {
      setAISetupOpen(true)
    }
  }, [showSetupGuide])

  const tabs = [
    {
      id: 'vault' as const,
      label: 'Vault',
      icon: <BsCoin />,
      description: 'Stake, earn rewards, and manage your positions',
    },
    {
      id: 'governance' as const,
      label: 'Governance',
      icon: <BsCoin />,
      description: 'Vote on proposals and participate in protocol governance',
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: <AiOutlineLineChart />,
      description: 'View protocol metrics and performance data',
    },
    {
      id: 'tools' as const,
      label: 'Tools',
      icon: <AiOutlineTool />,
      description: 'Algorand utilities: payments, tokens, NFTs, and contracts',
    },
    ...(isAIEnabled
      ? [
          {
            id: 'ai' as const,
            label: 'AI Insights',
            icon: <AiOutlineRobot />,
            description: 'AI-powered predictions, optimization, and risk analysis',
          },
        ]
      : []),
  ]

  const handleTransactionComplete = (txId: string, type: 'stake' | 'unstake') => {
    console.log(`Transaction ${type} completed: ${txId}`)
    // Could show success notification, refresh data, etc.
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
              <BsCoin className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">AlgoVault</h1>
              <p className="text-sm text-gray-400">Advanced DeFi yield farming on Algorand</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            {poolData && !stakingLoading && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">APY</div>
                  <div className="text-cyan-400 font-semibold">{poolData.apy.toFixed(2)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">TVL</div>
                  <div className="text-green-400 font-semibold">${((Number(poolData.totalStaked) / 1e6) * 0.25).toFixed(1)}M</div>
                </div>
                {userVotingPower > 0n && (
                  <div className="text-center">
                    <div className="text-gray-400">Voting Power</div>
                    <div className="text-purple-400 font-semibold">{(Number(userVotingPower) / 1e6).toFixed(0)} ALGO</div>
                  </div>
                )}
              </div>
            )}

            {/* AI Chat Button */}
            {isAIEnabled && activeAddress && (
              <button
                onClick={() => {
                  setAIChatOpen(true)
                  setAIChatMinimized(false)
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-sm font-semibold text-white transition-all duration-300 transform hover:scale-105"
              >
                <AiOutlineRobot className="text-lg" />
                <span className="hidden md:inline">AI Assistant</span>
              </button>
            )}

            {/* Wallet Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-semibold text-gray-100 transition-all duration-300"
              onClick={() => setOpenWalletModal(true)}
            >
              <AiOutlineWallet className="text-lg text-cyan-400" />
              <span>{activeAddress ? `${activeAddress.substring(0, 8)}...` : 'Connect Wallet'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI Header */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <AIHeader
          poolData={poolData || undefined}
          onOpenChat={() => {
            setAIChatOpen(true)
            setAIChatMinimized(false)
          }}
          onOpenSetup={() => setAISetupOpen(true)}
        />
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-neutral-800/50 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 font-medium text-sm transition-all duration-300 relative ${
                  activeTab === tab.id ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!activeAddress ? (
          /* Wallet Connection Prompt */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <AiOutlineWallet className="text-3xl text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Connect your Algorand wallet to start staking, earning rewards, and participating in governance.
            </p>
            <button
              onClick={() => setOpenWalletModal(true)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all duration-300 transform active:scale-95"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          /* Main Dashboard Content */
          <div className="space-y-8">
            {activeTab === 'vault' && (
              <div className="space-y-8">
                {/* Vault Overview */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                    <BsCoin className="text-cyan-400" />
                    Staking Vault
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pool Overview */}
                    <div className="lg:col-span-2">
                      {poolData ? (
                        <PoolOverview
                          poolData={poolData}
                          onStakeClick={() => {
                            // Could scroll to staking interface or open modal
                            document.getElementById('staking-interface')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        />
                      ) : (
                        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-8 text-center">
                          <div className="animate-pulse">
                            <div className="w-16 h-16 bg-neutral-700 rounded-full mx-auto mb-4"></div>
                            <div className="h-4 bg-neutral-700 rounded w-3/4 mx-auto mb-2"></div>
                            <div className="h-3 bg-neutral-700 rounded w-1/2 mx-auto"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Staking Interface */}
                    <div id="staking-interface">
                      <StakingInterface poolId={selectedPool} onTransactionComplete={handleTransactionComplete} />
                    </div>
                  </div>
                </div>

                {/* Reward Tracker */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                    <AiOutlineGift className="text-green-400" />
                    Rewards & Earnings
                  </h2>

                  {poolData && (
                    <RewardTracker poolData={poolData} userStake={userStake} onClaimRewards={claimRewards} claiming={claiming} />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'governance' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <BsCoin className="text-purple-400" />
                    Protocol Governance
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Participate in AlgoVault governance by voting on proposals that shape the protocol's future.
                  </p>

                  {/* Governance Stats */}
                  {governanceStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Active Proposals</div>
                        <div className="text-2xl font-bold text-purple-400">{governanceStats.activeProposals}</div>
                      </div>
                      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Total Voters</div>
                        <div className="text-2xl font-bold text-blue-400">{governanceStats.totalVoters}</div>
                      </div>
                      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Avg Participation</div>
                        <div className="text-2xl font-bold text-green-400">{governanceStats.averageParticipation.toFixed(1)}%</div>
                      </div>
                      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Your Voting Power</div>
                        <div className="text-2xl font-bold text-cyan-400">{(Number(userVotingPower) / 1e6).toFixed(0)}</div>
                      </div>
                    </div>
                  )}

                  <ProposalList
                    onProposalClick={(proposal) => {
                      console.log('Clicked proposal:', proposal.id)
                      // Could open detailed proposal modal
                    }}
                    onVoteClick={(proposalId, option) => {
                      console.log('Voted on proposal:', proposalId, option)
                    }}
                    onCreateClick={() => setOpenCreateProposalModal(true)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <AiOutlineLineChart className="text-cyan-400" />
                    Protocol Analytics
                  </h2>
                  <p className="text-gray-400 mb-6">Monitor protocol performance, TVL trends, and key metrics.</p>

                  <TVLDashboard
                    onTimeframeChange={(timeframe) => {
                      console.log('Timeframe changed:', timeframe)
                    }}
                  />
                </div>

                {/* Additional Analytics Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <BsGraphUp className="text-green-400" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Protocol Revenue (24h)</span>
                        <span className="text-green-400 font-semibold">$12.4K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Users (24h)</span>
                        <span className="text-blue-400 font-semibold">234</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Transactions</span>
                        <span className="text-purple-400 font-semibold">1,456</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <AiOutlineIe className="text-yellow-400" />
                      Risk Assessment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Protocol Risk Score</span>
                        <span className="text-green-400 font-semibold">Low (85/100)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Liquidity Health</span>
                        <span className="text-green-400 font-semibold">Excellent</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Smart Contract Audits</span>
                        <span className="text-green-400 font-semibold">3 Passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <AiOutlineTool className="text-blue-400" />
                    Algorand Tools
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Essential Algorand utilities for payments, asset creation, and smart contract interactions.
                  </p>

                  {/* Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Send Payment */}
                    <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-green-500 transition">
                      <AiOutlineSend className="text-4xl mb-3 text-green-400" />
                      <h3 className="text-lg font-semibold mb-2">Send Payment</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Send ALGO or USDC to any address on TestNet. Perfect for testing transactions and funding operations.
                      </p>
                      <button
                        className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                        onClick={() => setOpenPaymentModal(true)}
                      >
                        Open Payment Tool
                      </button>
                    </div>

                    {/* Mint NFT */}
                    <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-pink-500 transition">
                      <AiOutlineStar className="text-4xl mb-3 text-pink-400" />
                      <h3 className="text-lg font-semibold mb-2">Mint NFT</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Create unique NFTs with IPFS metadata storage. Great for tokenizing assets or creating collectibles.
                      </p>
                      <button
                        className="w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition"
                        onClick={() => setOpenMintModal(true)}
                      >
                        Create NFT
                      </button>
                    </div>

                    {/* Create Token */}
                    <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-purple-500 transition">
                      <BsArrowUpRightCircle className="text-4xl mb-3 text-purple-400" />
                      <h3 className="text-lg font-semibold mb-2">Create Token (ASA)</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Launch your own Algorand Standard Asset (ASA). Ideal for creating project tokens or rewards.
                      </p>
                      <button
                        className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition"
                        onClick={() => setOpenTokenModal(true)}
                      >
                        Create Token
                      </button>
                    </div>

                    {/* Contract Interactions */}
                    <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-amber-500 transition">
                      <AiOutlineDeploymentUnit className="text-4xl mb-3 text-amber-400" />
                      <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Interact with deployed smart contracts and test application calls on the Algorand network.
                      </p>
                      <button
                        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition"
                        onClick={() => setOpenAppCallsModal(true)}
                      >
                        Contract Tools
                      </button>
                    </div>
                  </div>

                  {/* Tools Information */}
                  <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center gap-2">
                      <AiOutlineIe className="text-blue-400" />
                      Algorand Network Tools
                    </h3>
                    <p className="text-gray-400 mb-4">
                      These tools help you interact with the Algorand blockchain for various operations beyond yield farming.
                      All transactions are performed on TestNet for safe testing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">TestNet transactions (no real value)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">IPFS metadata storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">Smart contract interactions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-gray-300">Asset creation and management</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && isAIEnabled && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-200 mb-2 flex items-center gap-2">
                    <AiOutlineRobot className="text-purple-400" />
                    AI-Powered Insights
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Leverage artificial intelligence for yield predictions, portfolio optimization, and risk analysis.
                  </p>

                  {/* AI Features Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Yield Prediction */}
                    <div className="space-y-6">
                      {poolData && (
                        <AIYieldPredictor
                          poolData={poolData}
                          onPredictionComplete={(predictions) => {
                            console.log('Yield predictions:', predictions)
                          }}
                        />
                      )}

                      {poolData && (
                        <AIRiskAssessment
                          poolData={poolData}
                          onAssessmentComplete={(assessment) => {
                            console.log('Risk assessment:', assessment)
                          }}
                        />
                      )}
                    </div>

                    {/* Portfolio Optimization */}
                    <div className="space-y-6">
                      <AIPortfolioOptimizer
                        pools={poolData ? [poolData] : []}
                        userStakes={
                          userStake
                            ? [
                                {
                                  ...userStake,
                                  poolId: selectedPool,
                                  stakedAmount: userStake.stakedAmount ?? 0, // or the correct property if it exists
                                },
                              ]
                            : []
                        }
                        onOptimizationComplete={(optimization) => {
                          console.log('Portfolio optimization:', optimization)
                        }}
                      />
                    </div>
                  </div>

                  {/* AI Features Overview */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                        <AiOutlineBulb className="text-xl text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Smart Predictions</h3>
                      <p className="text-sm text-gray-400">
                        AI analyzes market trends, historical data, and pool metrics to forecast future yields with confidence intervals.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                        <BsPieChart className="text-xl text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Portfolio Optimization</h3>
                      <p className="text-sm text-gray-400">
                        Get personalized allocation recommendations based on your risk tolerance and investment goals.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/20 rounded-xl p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <AiOutlineIe className="text-xl text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Risk Analysis</h3>
                      <p className="text-sm text-gray-400">
                        Comprehensive risk assessment covering smart contract security, market volatility, and liquidity risks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Connect Wallet Modal */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={openCreateProposalModal}
        onClose={() => setOpenCreateProposalModal(false)}
        onProposalCreated={(proposalId) => {
          console.log('Proposal created:', proposalId)
          // Could show success notification or redirect
        }}
      />

      {/* Tool Modals */}
      <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />
      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} />

      {/* AI Chat Assistant */}
      {isAIEnabled && (
        <AIChatAssistant
          isOpen={aiChatOpen}
          isMinimized={aiChatMinimized}
          onClose={() => setAIChatOpen(false)}
          onMinimize={() => setAIChatMinimized(true)}
          onMaximize={() => setAIChatMinimized(false)}
          userContext={{
            userStakes: userStake ? [userStake] : [],
            portfolioValue: userStake ? Number(userStake.stakedAmount) / 1e6 : 0,
            recentActivity: [],
          }}
        />
      )}

      {/* AI Setup Guide Modal */}
      {(aiSetupOpen || showSetupGuide) && (
        <AISetupGuide onClose={() => {
          setAISetupOpen(false)
          setShowSetupGuide(false)
        }} />
      )}

      {/* AI Floating Actions */}
      <AIFloatingActions
        onOpenChat={() => {
          setAIChatOpen(true)
          setAIChatMinimized(false)
        }}
        onOpenYieldPredictor={() => setActiveTab('ai')}
        onOpenPortfolioOptimizer={() => setActiveTab('ai')}
        onOpenRiskAssessment={() => setActiveTab('ai')}
        onOpenSetup={() => setAISetupOpen(true)}
      />
    </div>
  )
}

export default VaultDashboard
