import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  BsGraphUp,
  BsArrowLeftRight,
  BsDroplet,
  BsRobot,
  BsLightning,
  BsShield,
  BsGear,
  BsPlusCircle,
  BsSearch,
  BsBarChartLine
} from 'react-icons/bs'
import AITradingAssistant from './AITradingAssistant'
import AdvancedSwap from './AdvancedSwap'
import LiquidStaking from './LiquidStaking'
import { getAITinymanService } from '../../services/tinyman/aiTinymanService'
import { getTinymanService } from '../../services/tinyman/tinymanService'
import {
  MarketIntelligence,
  TradingOpportunity,
  PoolAnalytics,
  AIPortfolioSuggestion
} from '../../services/tinyman/types'

interface TinymanDashboardProps {
  openModal: boolean
  closeModal: () => void
}

interface DashboardTab {
  id: string
  label: string
  icon: React.ReactNode
}

const TinymanDashboard = ({ openModal, closeModal }: TinymanDashboardProps) => {
  const { activeAddress } = useWallet()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showAdvancedSwap, setShowAdvancedSwap] = useState(false)
  const [showLiquidStaking, setShowLiquidStaking] = useState(false)

  // Data state
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null)
  const [opportunities, setOpportunities] = useState<TradingOpportunity[]>([])
  const [topPools, setTopPools] = useState<PoolAnalytics[]>([])
  const [portfolioSuggestion, setPortfolioSuggestion] = useState<AIPortfolioSuggestion | null>(null)
  const [loading, setLoading] = useState(false)

  const aiService = getAITinymanService()
  const tinymanService = getTinymanService()

  const tabs: DashboardTab[] = [
    { id: 'overview', label: 'Overview', icon: <BsGraphUp /> },
    { id: 'swap', label: 'Swap', icon: <BsArrowLeftRight /> },
    { id: 'liquidity', label: 'Liquidity', icon: <BsDroplet /> },
    { id: 'staking', label: 'Liquid Staking', icon: <BsShield /> },
    { id: 'portfolio', label: 'Portfolio', icon: <BsShield /> },
    { id: 'opportunities', label: 'Opportunities', icon: <BsBarChartLine /> }
  ]

  useEffect(() => {
    if (openModal && activeAddress) {
      loadDashboardData()
    }
  }, [openModal, activeAddress])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [intel, ops, portfolio] = await Promise.all([
        aiService.getMarketIntelligence(),
        aiService.findTradingOpportunities(activeAddress!),
        aiService.getAIPortfolioSuggestion(BigInt(1000000), 'moderate', 6)
      ])

      setMarketIntel(intel)
      setOpportunities(ops)
      setPortfolioSuggestion(portfolio)

      // Mock pool data - in real implementation, fetch from Tinyman API
      setTopPools([
        {
          pool: { assetA: { id: 0 }, assetB: { id: 31566704 } } as any,
          totalLiquidity: BigInt(5000000000000),
          volume24h: BigInt(1000000000000),
          volume7d: BigInt(7000000000000),
          fees24h: BigInt(10000000000),
          apy: 12.5,
          utilization: 75,
          impermanentLoss: 2.3,
          riskScore: 3.2
        }
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: bigint, decimals: number = 6, symbol: string = 'ALGO') => {
    const value = Number(amount) / Math.pow(10, decimals)
    return `${value.toLocaleString()} ${symbol}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Market Intelligence Summary */}
      {marketIntel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex items-center gap-2 mb-2">
              <BsGraphUp className="text-green-400" />
              <span className="text-sm text-gray-400">Market Sentiment</span>
            </div>
            <div className="text-2xl font-bold text-green-400 capitalize">
              {marketIntel.sentiment}
            </div>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex items-center gap-2 mb-2">
              <BsLightning className="text-yellow-400" />
              <span className="text-sm text-gray-400">Volatility</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400 capitalize">
              {marketIntel.volatility}
            </div>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex items-center gap-2 mb-2">
              <BsShield className="text-blue-400" />
              <span className="text-sm text-gray-400">Direction</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 capitalize">
              {marketIntel.priceDirection}
            </div>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex items-center gap-2 mb-2">
              <BsBarChartLine className="text-purple-400" />
              <span className="text-sm text-gray-400">Opportunities</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {opportunities.length}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowAdvancedSwap(true)}
          className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
        >
          <BsArrowLeftRight className="text-4xl text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Swap</h3>
          <p className="text-sm text-gray-400">
            Swap tokens with AI optimization and smart routing
          </p>
        </button>

        <button
          onClick={() => setShowLiquidStaking(true)}
          className="p-6 bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors"
        >
          <BsShield className="text-4xl text-green-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Liquid Staking</h3>
          <p className="text-sm text-gray-400">
            Stake ALGO, earn rewards, and maintain liquidity with tALGO
          </p>
        </button>

        <button
          onClick={() => setShowAIAssistant(true)}
          className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors"
        >
          <BsRobot className="text-4xl text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
          <p className="text-sm text-gray-400">
            Natural language trading with AI recommendations
          </p>
        </button>
      </div>

      {/* Top Pools */}
      <div className="bg-neutral-700 rounded-lg border border-neutral-600 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BsDroplet className="text-blue-400" />
          Top Performing Pools
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-neutral-600">
                <th className="pb-2">Pool</th>
                <th className="pb-2">APY</th>
                <th className="pb-2">TVL</th>
                <th className="pb-2">24h Volume</th>
                <th className="pb-2">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {topPools.map((pool, index) => (
                <tr key={index} className="border-b border-neutral-600/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        A
                      </div>
                      <span>ALGO/USDC</span>
                    </div>
                  </td>
                  <td className="py-3 text-green-400">{formatPercentage(pool.apy)}</td>
                  <td className="py-3">{formatCurrency(pool.totalLiquidity)}</td>
                  <td className="py-3">{formatCurrency(pool.volume24h)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      pool.riskScore < 3 ? 'bg-green-600/20 text-green-400' :
                      pool.riskScore < 6 ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {pool.riskScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSwap = () => (
    <div className="text-center py-12">
      <BsArrowLeftRight className="text-6xl text-blue-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold mb-4">Advanced Swap Interface</h3>
      <p className="text-gray-400 mb-6">
        Use our AI-powered swap interface for optimal trading
      </p>
      <button
        onClick={() => setShowAdvancedSwap(true)}
        className="btn bg-blue-600 hover:bg-blue-500 border-none text-white"
      >
        Open Advanced Swap
      </button>
    </div>
  )

  const renderLiquidity = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Liquidity Management</h3>
        <button className="btn bg-green-600 hover:bg-green-500 border-none text-white">
          <BsPlusCircle className="mr-2" />
          Add Liquidity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
          <h4 className="font-semibold mb-4">Your Liquidity Positions</h4>
          <div className="text-center py-8 text-gray-400">
            <BsDroplet className="text-4xl mx-auto mb-2" />
            <p>No liquidity positions found</p>
            <p className="text-sm">Add liquidity to start earning fees</p>
          </div>
        </div>

        <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
          <h4 className="font-semibold mb-4">AI Recommendations</h4>
          {portfolioSuggestion && (
            <div className="space-y-3">
              {portfolioSuggestion.allocations.map((allocation, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-neutral-600 rounded">
                  <div>
                    <span className="font-medium">{allocation.symbol}</span>
                    <p className="text-xs text-gray-400">{allocation.reasoning}</p>
                  </div>
                  <span className="text-green-400">{allocation.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStaking = () => (
    <div className="text-center py-12">
      <BsShield className="text-6xl text-green-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold mb-4">Liquid Staking Interface</h3>
      <p className="text-gray-400 mb-6">
        Stake ALGO, earn rewards, and maintain liquidity with our AI-optimized staking strategies
      </p>
      <button
        onClick={() => setShowLiquidStaking(true)}
        className="btn bg-green-600 hover:bg-green-500 border-none text-white"
      >
        Open Liquid Staking
      </button>
    </div>
  )

  const renderPortfolio = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Portfolio Overview</h3>

      {portfolioSuggestion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
            <h4 className="font-semibold mb-4">AI Portfolio Optimization</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Expected APY</span>
                <span className="text-green-400">{formatPercentage(portfolioSuggestion.expectedApy)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level</span>
                <span className="capitalize">{portfolioSuggestion.riskLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rebalance</span>
                <span className="capitalize">{portfolioSuggestion.rebalanceFrequency}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-900/20 rounded border border-purple-500/30">
              <p className="text-sm text-purple-300">{portfolioSuggestion.aiReasoning}</p>
            </div>
          </div>

          <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
            <h4 className="font-semibold mb-4">Asset Allocation</h4>
            <div className="space-y-2">
              {portfolioSuggestion.allocations.map((allocation, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="flex-1">{allocation.symbol}</span>
                  <span>{allocation.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderOpportunities = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">AI-Identified Opportunities</h3>

      <div className="grid grid-cols-1 gap-4">
        {opportunities.map((opportunity, index) => (
          <div key={index} className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold capitalize">{opportunity.type.replace('-', ' ')}</h4>
                <p className="text-sm text-gray-400">{opportunity.description}</p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold">
                  +{formatPercentage(opportunity.expectedReturn)}
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  opportunity.riskLevel === 'low' ? 'bg-green-600/20 text-green-400' :
                  opportunity.riskLevel === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-red-600/20 text-red-400'
                }`}>
                  {opportunity.riskLevel} risk
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Timeframe</span>
                <span>{opportunity.timeframe}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Confidence</span>
                <span>{formatPercentage(opportunity.confidence * 100)}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Required Actions:</p>
              <ul className="text-sm space-y-1">
                {opportunity.requiredActions.map((action, actionIndex) => (
                  <li key={actionIndex} className="flex items-center gap-2">
                    <BsArrowLeftRight className="text-blue-400 text-xs" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {opportunities.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BsSearch className="text-6xl mx-auto mb-4" />
            <p>No opportunities found at the moment</p>
            <p className="text-sm">Check back later for AI-identified trading opportunities</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'swap': return renderSwap()
      case 'liquidity': return renderLiquidity()
      case 'staking': return renderStaking()
      case 'portfolio': return renderPortfolio()
      case 'opportunities': return renderOpportunities()
      default: return renderOverview()
    }
  }

  return (
    <>
      <dialog
        id="tinyman_dashboard_modal"
        className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}
      >
        <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-0 max-w-6xl w-full h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <div className="flex items-center gap-3">
              <BsGraphUp className="text-3xl text-blue-400" />
              <div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Tinyman AI Dashboard
                </h3>
                <p className="text-sm text-gray-400">Advanced DeFi trading with AI intelligence</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-700 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading dashboard data...</p>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </dialog>

      {/* Modals */}
      <AITradingAssistant
        openModal={showAIAssistant}
        closeModal={() => setShowAIAssistant(false)}
      />
      <AdvancedSwap
        openModal={showAdvancedSwap}
        closeModal={() => setShowAdvancedSwap(false)}
      />
      <LiquidStaking
        openModal={showLiquidStaking}
        closeModal={() => setShowLiquidStaking(false)}
      />
    </>
  )
}

export default TinymanDashboard