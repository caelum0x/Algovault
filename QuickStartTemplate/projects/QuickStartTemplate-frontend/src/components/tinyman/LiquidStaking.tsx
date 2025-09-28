import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import {
  BsLayers,
  BsRobot,
  BsGraphUp,
  BsShield,
  BsTrophy,
  BsArrowUp,
  BsArrowDown,
  BsGift,
  BsInfoCircle,
  BsLightning
} from 'react-icons/bs'
import { getLiquidStakingService, LIQUID_STAKING_CONSTANTS } from '../../services/tinyman/liquidStakingService'

interface LiquidStakingProps {
  openModal: boolean
  closeModal: () => void
}

interface StakingPosition {
  algoBalance: bigint
  talgoBalance: bigint
  stalgoBalance: bigint
  pendingTinyRewards: bigint
  tinyPower: number
  canReStake: boolean
}

interface StakingTab {
  id: string
  label: string
  icon: React.ReactNode
}

const LiquidStaking = ({ openModal, closeModal }: LiquidStakingProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [activeTab, setActiveTab] = useState('stake')
  const [loading, setLoading] = useState(false)

  // Form state
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [reStakeAmount, setReStakeAmount] = useState('')

  // Data state
  const [position, setPosition] = useState<StakingPosition | null>(null)
  const [stakingAnalytics, setStakingAnalytics] = useState<any>(null)
  const [aiStrategy, setAiStrategy] = useState<any>(null)

  const stakingService = getLiquidStakingService()

  const tabs: StakingTab[] = [
    { id: 'stake', label: 'Stake ALGO', icon: <BsArrowUp /> },
    { id: 'unstake', label: 'Unstake tALGO', icon: <BsArrowDown /> },
    { id: 'restake', label: 'Re-Stake', icon: <BsLayers /> },
    { id: 'analytics', label: 'Analytics', icon: <BsGraphUp /> }
  ]

  useEffect(() => {
    if (openModal && activeAddress) {
      loadStakingData()
    }
  }, [openModal, activeAddress])

  const loadStakingData = async () => {
    try {
      setLoading(true)
      const [userPosition, analytics, strategy] = await Promise.all([
        stakingService.getUserStakingPosition(activeAddress!),
        stakingService.getStakingAnalytics(),
        stakingService.getAIStakingStrategy(activeAddress!, BigInt(0), BigInt(0), 'moderate')
      ])

      setPosition(userPosition)
      setStakingAnalytics(analytics)
      setAiStrategy(strategy)
    } catch (error) {
      console.error('Failed to load staking data:', error)
      enqueueSnackbar('Failed to load staking data', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleStake = async () => {
    if (!activeAddress || !transactionSigner || !stakeAmount) return

    try {
      setLoading(true)
      const amount = BigInt(parseFloat(stakeAmount) * 1000000) // Convert to microALGOs

      // Get quote first
      const quote = await stakingService.getStakingQuote(amount)

      enqueueSnackbar(`Staking ${stakeAmount} ALGO for ${formatAlgo(quote.talgoAmount)} tALGO...`, { variant: 'info' })

      const result = await stakingService.stakeAlgo(amount, activeAddress, transactionSigner)

      enqueueSnackbar(`✅ Staked successfully! TX: ${result.txId}`, { variant: 'success' })
      setStakeAmount('')
      await loadStakingData()

    } catch (error: any) {
      console.error('Staking failed:', error)
      enqueueSnackbar(`Staking failed: ${error.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleUnstake = async () => {
    if (!activeAddress || !transactionSigner || !unstakeAmount) return

    try {
      setLoading(true)
      const amount = BigInt(parseFloat(unstakeAmount) * 1000000)

      const quote = await stakingService.getUnstakingQuote(amount)

      enqueueSnackbar(`Unstaking ${unstakeAmount} tALGO for ${formatAlgo(quote.algoAmount)} ALGO...`, { variant: 'info' })

      const result = await stakingService.unstakeTalgo(amount, activeAddress, transactionSigner)

      enqueueSnackbar(`✅ Unstaked successfully! TX: ${result.txId}`, { variant: 'success' })
      setUnstakeAmount('')
      await loadStakingData()

    } catch (error: any) {
      console.error('Unstaking failed:', error)
      enqueueSnackbar(`Unstaking failed: ${error.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReStake = async () => {
    if (!activeAddress || !transactionSigner || !reStakeAmount) return

    try {
      setLoading(true)
      const amount = BigInt(parseFloat(reStakeAmount) * 1000000)

      // Check if user can re-stake
      const quote = await stakingService.getReStakingQuote(amount, activeAddress)

      if (!quote.canReStake) {
        enqueueSnackbar(`Insufficient TINY power. Required: ${quote.requiredTinyPower}, Current: ${quote.userTinyPower}`, { variant: 'error' })
        return
      }

      enqueueSnackbar(`Re-staking ${reStakeAmount} tALGO for TINY rewards...`, { variant: 'info' })

      const result = await stakingService.reStakeTalgo(amount, activeAddress, transactionSigner)

      enqueueSnackbar(`✅ Re-staked successfully! TX: ${result.txId}`, { variant: 'success' })
      setReStakeAmount('')
      await loadStakingData()

    } catch (error: any) {
      console.error('Re-staking failed:', error)
      enqueueSnackbar(`Re-staking failed: ${error.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!activeAddress || !transactionSigner) return

    try {
      setLoading(true)
      enqueueSnackbar('Claiming TINY rewards...', { variant: 'info' })

      const result = await stakingService.claimTinyRewards(activeAddress, transactionSigner)

      enqueueSnackbar(`✅ Rewards claimed! TX: ${result.txId}`, { variant: 'success' })
      await loadStakingData()

    } catch (error: any) {
      console.error('Claim failed:', error)
      enqueueSnackbar(`Claim failed: ${error.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const formatAlgo = (amount: bigint) => {
    return (Number(amount) / 1000000).toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const renderStakeTab = () => (
    <div className="space-y-6">
      {/* AI Strategy Recommendation */}
      {aiStrategy && aiStrategy.recommendation === 'stake' && (
        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <BsRobot className="text-purple-400" />
            <span className="font-semibold text-purple-300">AI Recommendation</span>
          </div>
          <p className="text-sm text-purple-200">{aiStrategy.reasoning}</p>
          <div className="flex gap-4 mt-2 text-xs">
            <span>Expected APR: {formatPercentage(aiStrategy.expectedAPR)}</span>
            <span>Risk: {aiStrategy.riskLevel}</span>
            <span>Confidence: {formatPercentage(aiStrategy.confidence)}</span>
          </div>
        </div>
      )}

      {/* Staking Interface */}
      <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BsLayers className="text-green-400" />
          Stake ALGO → Earn tALGO
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Stake (ALGO)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-3 bg-neutral-600 border border-neutral-500 rounded-lg text-white"
              />
              <button
                onClick={() => position && setStakeAmount(formatAlgo(position.algoBalance))}
                className="btn bg-neutral-600 hover:bg-neutral-500 border-none text-white"
              >
                MAX
              </button>
            </div>
            {position && (
              <p className="text-xs text-gray-400 mt-1">
                Available: {formatAlgo(position.algoBalance)} ALGO
              </p>
            )}
          </div>

          {/* Staking Preview */}
          {stakeAmount && stakingAnalytics && (
            <div className="p-4 bg-neutral-600 rounded-lg">
              <h5 className="font-medium mb-2">Staking Preview</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">You stake</span>
                  <span>{stakeAmount} ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You receive</span>
                  <span className="text-green-400">
                    {(parseFloat(stakeAmount) / stakingAnalytics.exchangeRate).toFixed(6)} tALGO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current APR</span>
                  <span className="text-green-400">{formatPercentage(stakingAnalytics.currentAPR)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span>1 tALGO = {stakingAnalytics.exchangeRate.toFixed(6)} ALGO</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleStake}
            disabled={!stakeAmount || loading || !activeAddress}
            className="w-full btn bg-green-600 hover:bg-green-500 border-none text-white disabled:opacity-50"
          >
            {loading ? 'Staking...' : 'Stake ALGO'}
          </button>
        </div>
      </div>

      {/* Staking Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <BsShield className="text-blue-400" />
            Staking Benefits
          </h5>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• Earn {stakingAnalytics?.currentAPR ? formatPercentage(stakingAnalytics.currentAPR) : '~8%'} APR</li>
            <li>• No lock-up period</li>
            <li>• Liquid tALGO tokens</li>
            <li>• Automatic compounding</li>
          </ul>
        </div>

        <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <BsInfoCircle className="text-yellow-400" />
            Protocol Details
          </h5>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• 3% protocol fee on rewards</li>
            <li>• Instant unstaking available</li>
            <li>• Re-stake for TINY rewards</li>
            <li>• Participate in governance</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderUnstakeTab = () => (
    <div className="space-y-6">
      <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BsArrowDown className="text-orange-400" />
          Unstake tALGO → Receive ALGO
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Unstake (tALGO)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-3 bg-neutral-600 border border-neutral-500 rounded-lg text-white"
              />
              <button
                onClick={() => position && setUnstakeAmount(formatAlgo(position.talgoBalance))}
                className="btn bg-neutral-600 hover:bg-neutral-500 border-none text-white"
              >
                MAX
              </button>
            </div>
            {position && (
              <p className="text-xs text-gray-400 mt-1">
                Available: {formatAlgo(position.talgoBalance)} tALGO
              </p>
            )}
          </div>

          {/* Unstaking Preview */}
          {unstakeAmount && stakingAnalytics && (
            <div className="p-4 bg-neutral-600 rounded-lg">
              <h5 className="font-medium mb-2">Unstaking Preview</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">You unstake</span>
                  <span>{unstakeAmount} tALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You receive</span>
                  <span className="text-green-400">
                    {(parseFloat(unstakeAmount) * stakingAnalytics.exchangeRate).toFixed(6)} ALGO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Accrued rewards</span>
                  <span className="text-green-400">
                    {((parseFloat(unstakeAmount) * stakingAnalytics.exchangeRate) - parseFloat(unstakeAmount)).toFixed(6)} ALGO
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleUnstake}
            disabled={!unstakeAmount || loading || !activeAddress}
            className="w-full btn bg-orange-600 hover:bg-orange-500 border-none text-white disabled:opacity-50"
          >
            {loading ? 'Unstaking...' : 'Unstake tALGO'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderReStakeTab = () => (
    <div className="space-y-6">
      {/* Re-staking Requirements */}
      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <BsTrophy className="text-blue-400" />
          <span className="font-semibold">Re-Staking Requirements</span>
        </div>
        <p className="text-sm text-blue-200 mb-2">
          Minimum {LIQUID_STAKING_CONSTANTS.MIN_TINY_POWER} TINY power required for re-staking
        </p>
        {position && (
          <div className="flex justify-between text-sm">
            <span>Your TINY Power:</span>
            <span className={position.canReStake ? 'text-green-400' : 'text-red-400'}>
              {position.tinyPower} {position.canReStake ? '✓' : '✗'}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BsLayers className="text-purple-400" />
          Re-Stake tALGO → Earn TINY Rewards
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Re-Stake (tALGO)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={reStakeAmount}
                onChange={(e) => setReStakeAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-3 bg-neutral-600 border border-neutral-500 rounded-lg text-white"
                disabled={!position?.canReStake}
              />
              <button
                onClick={() => position && setReStakeAmount(formatAlgo(position.talgoBalance))}
                className="btn bg-neutral-600 hover:bg-neutral-500 border-none text-white"
                disabled={!position?.canReStake}
              >
                MAX
              </button>
            </div>
            {position && (
              <p className="text-xs text-gray-400 mt-1">
                Available: {formatAlgo(position.talgoBalance)} tALGO
              </p>
            )}
          </div>

          {/* Re-staking Preview */}
          {reStakeAmount && position?.canReStake && (
            <div className="p-4 bg-neutral-600 rounded-lg">
              <h5 className="font-medium mb-2">Re-Staking Preview</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">You re-stake</span>
                  <span>{reStakeAmount} tALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You receive</span>
                  <span className="text-purple-400">{reStakeAmount} stALGO (1:1 ratio)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TINY rewards APR</span>
                  <span className="text-purple-400">~12%</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleReStake}
            disabled={!reStakeAmount || loading || !activeAddress || !position?.canReStake}
            className="w-full btn bg-purple-600 hover:bg-purple-500 border-none text-white disabled:opacity-50"
          >
            {loading ? 'Re-Staking...' : !position?.canReStake ? 'Insufficient TINY Power' : 'Re-Stake tALGO'}
          </button>
        </div>
      </div>

      {/* Pending Rewards */}
      {position && position.pendingTinyRewards > 0n && (
        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="font-medium flex items-center gap-2">
                <BsGift className="text-purple-400" />
                Pending TINY Rewards
              </h5>
              <p className="text-2xl font-bold text-purple-400">
                {formatAlgo(position.pendingTinyRewards)} TINY
              </p>
            </div>
            <button
              onClick={handleClaimRewards}
              disabled={loading}
              className="btn bg-purple-600 hover:bg-purple-500 border-none text-white"
            >
              {loading ? 'Claiming...' : 'Claim Rewards'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* User Position Summary */}
      {position && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <h5 className="font-medium text-gray-400 mb-1">Total Staked</h5>
            <p className="text-2xl font-bold text-green-400">
              {formatAlgo(position.talgoBalance)} tALGO
            </p>
            <p className="text-sm text-gray-400">
              ≈ {stakingAnalytics ? formatAlgo(BigInt(Number(position.talgoBalance) * stakingAnalytics.exchangeRate)) : '--'} ALGO
            </p>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <h5 className="font-medium text-gray-400 mb-1">Re-Staked</h5>
            <p className="text-2xl font-bold text-purple-400">
              {formatAlgo(position.stalgoBalance)} stALGO
            </p>
            <p className="text-sm text-gray-400">Earning TINY rewards</p>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <h5 className="font-medium text-gray-400 mb-1">TINY Power</h5>
            <p className="text-2xl font-bold text-blue-400">{position.tinyPower}</p>
            <p className="text-sm text-gray-400">
              {position.canReStake ? 'Can re-stake' : 'Need more power'}
            </p>
          </div>
        </div>
      )}

      {/* Protocol Analytics */}
      {stakingAnalytics && (
        <div className="p-6 bg-neutral-700 rounded-lg border border-neutral-600">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BsGraphUp className="text-blue-400" />
            Protocol Analytics
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Staked</span>
                <span>{formatAlgo(stakingAnalytics.totalStaked)} ALGO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">tALGO Supply</span>
                <span>{formatAlgo(stakingAnalytics.totalSupply)} tALGO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Exchange Rate</span>
                <span>1 tALGO = {stakingAnalytics.exchangeRate.toFixed(6)} ALGO</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current APR</span>
                <span className="text-green-400">{formatPercentage(stakingAnalytics.currentAPR)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Utilization</span>
                <span>{formatPercentage(stakingAnalytics.utilizationRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol Fee</span>
                <span>{formatPercentage(LIQUID_STAKING_CONSTANTS.PROTOCOL_FEE)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Strategy */}
      {aiStrategy && (
        <div className="p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BsRobot className="text-purple-400" />
            AI Strategy Recommendation
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Recommendation</span>
              <span className="capitalize font-semibold text-purple-400">{aiStrategy.recommendation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expected APR</span>
              <span className="text-green-400">{formatPercentage(aiStrategy.expectedAPR)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Level</span>
              <span className="capitalize">{aiStrategy.riskLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence</span>
              <span>{formatPercentage(aiStrategy.confidence)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-900/30 rounded">
            <p className="text-sm text-purple-200">{aiStrategy.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stake': return renderStakeTab()
      case 'unstake': return renderUnstakeTab()
      case 'restake': return renderReStakeTab()
      case 'analytics': return renderAnalyticsTab()
      default: return renderStakeTab()
    }
  }

  return (
    <dialog
      id="liquid_staking_modal"
      className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}
    >
      <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-0 max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-green-900/20 to-purple-900/20">
          <div className="flex items-center gap-3">
            <BsLayers className="text-3xl text-green-400" />
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
                Tinyman Liquid Staking
              </h3>
              <p className="text-sm text-gray-400">Stake ALGO, earn rewards, stay liquid</p>
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
                  ? 'border-green-500 text-green-400'
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
          {loading && !position ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading staking data...</p>
              </div>
            </div>
          ) : !activeAddress ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BsLightning className="text-6xl text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Connect Your Wallet</h4>
                <p className="text-gray-400">Connect your wallet to start liquid staking</p>
              </div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </dialog>
  )
}

export default LiquidStaking