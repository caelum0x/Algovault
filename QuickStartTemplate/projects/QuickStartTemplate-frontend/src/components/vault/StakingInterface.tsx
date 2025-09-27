import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AiOutlineLoading3Quarters, AiOutlineSend, AiOutlineCalculator, AiOutlineInfoCircle, AiOutlineWarning } from 'react-icons/ai'
import { BsCoin, BsGraphUp } from 'react-icons/bs'
import { useStakingPool } from '../../hooks/useStakingPool'
import { algosToMicroAlgos, microAlgosToAlgos, formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface StakingInterfaceProps {
  poolId: string
  onTransactionComplete?: (txId: string, type: 'stake' | 'unstake') => void
}

export default function StakingInterface({ poolId, onTransactionComplete }: StakingInterfaceProps) {
  const { activeAddress } = useWallet()
  const { poolData, userStake, loading, staking, unstaking, stake, unstake, calculateProjections, canStake, canUnstake } =
    useStakingPool(poolId)

  // Form state
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [amount, setAmount] = useState('')
  const [showProjections, setShowProjections] = useState(false)

  // Reset form when switching tabs
  useEffect(() => {
    setAmount('')
  }, [activeTab])

  // Calculate real-time projections
  const projections = React.useMemo(() => {
    if (!amount || isNaN(Number(amount))) return null
    const amountMicroAlgos = algosToMicroAlgos(Number(amount))
    return calculateProjections(amountMicroAlgos)
  }, [amount, calculateProjections])

  // Handle stake
  const handleStake = async () => {
    if (!amount || !poolData) return

    const amountMicroAlgos = algosToMicroAlgos(Number(amount))
    const validation = canStake(amountMicroAlgos)

    if (!validation.canStake) return

    const txId = await stake(amountMicroAlgos)
    if (txId && onTransactionComplete) {
      onTransactionComplete(txId, 'stake')
    }

    // Reset form on success
    if (txId) {
      setAmount('')
    }
  }

  // Handle unstake
  const handleUnstake = async () => {
    if (!amount || !userStake) return

    const amountMicroAlgos = algosToMicroAlgos(Number(amount))
    const validation = canUnstake(amountMicroAlgos)

    if (!validation.canUnstake) return

    const txId = await unstake(amountMicroAlgos)
    if (txId && onTransactionComplete) {
      onTransactionComplete(txId, 'unstake')
    }

    // Reset form on success
    if (txId) {
      setAmount('')
    }
  }

  // Handle max amount
  const handleMaxAmount = () => {
    if (activeTab === 'stake') {
      // For staking, we'd need to get user's ALGO balance
      // This is simplified - in real implementation, fetch from wallet
      setAmount('10') // Mock max available
    } else if (activeTab === 'unstake' && userStake) {
      setAmount(microAlgosToAlgos(userStake.amount).toString())
    }
  }

  if (loading) {
    return (
      <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
        <div className="flex items-center justify-center py-8">
          <AiOutlineLoading3Quarters className="animate-spin text-3xl text-cyan-400" />
          <span className="ml-3 text-gray-300">Loading pool data...</span>
        </div>
      </div>
    )
  }

  if (!poolData) {
    return (
      <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
        <div className="flex items-center justify-center py-8">
          <AiOutlineWarning className="text-3xl text-yellow-400" />
          <span className="ml-3 text-gray-300">Failed to load pool data</span>
        </div>
      </div>
    )
  }

  const stakeValidation = amount ? canStake(algosToMicroAlgos(Number(amount))) : { canStake: false }
  const unstakeValidation = amount ? canUnstake(algosToMicroAlgos(Number(amount))) : { canUnstake: false }

  return (
    <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-3 mb-4">
          <BsCoin className="text-3xl text-cyan-400" />
          <div>
            <h3 className="text-xl font-bold text-gray-100">Stake {poolData.assetName}</h3>
            <p className="text-sm text-gray-400">Earn {poolData.apy.toFixed(2)}% APY</p>
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-neutral-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Total Staked</div>
            <div className="text-sm font-semibold text-gray-100">
              {formatLargeNumber(microAlgosToAlgos(poolData.totalStaked))} {poolData.assetName}
            </div>
          </div>
          <div className="bg-neutral-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Participants</div>
            <div className="text-sm font-semibold text-gray-100">{poolData.participants.toLocaleString()}</div>
          </div>
          <div className="bg-neutral-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Min Stake</div>
            <div className="text-sm font-semibold text-gray-100">
              {microAlgosToAlgos(poolData.minimumStake)} {poolData.assetName}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-700">
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'stake' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-neutral-700/50' : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('stake')}
        >
          Stake
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'unstake' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-neutral-700/50' : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('unstake')}
          disabled={!userStake || userStake.amount <= 0n}
        >
          Unstake
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* User Position (if exists) */}
        {userStake && userStake.amount > 0n && (
          <div className="bg-neutral-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BsGraphUp className="text-lg text-cyan-400" />
              <span className="text-sm font-medium text-gray-200">Your Position</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400">Staked Amount</div>
                <div className="text-lg font-semibold text-gray-100">
                  {microAlgosToAlgos(userStake.amount).toFixed(6)} {poolData.assetName}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Pending Rewards</div>
                <div className="text-lg font-semibold text-green-400">
                  {microAlgosToAlgos(userStake.pendingRewards).toFixed(6)} {poolData.assetName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount ({poolData.assetName})</label>
          <div className="relative">
            <input
              type="number"
              step="0.000001"
              min="0"
              placeholder={`Enter ${poolData.assetName} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={staking || unstaking}
            />
            <button
              type="button"
              onClick={handleMaxAmount}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              disabled={staking || unstaking}
            >
              MAX
            </button>
          </div>

          {/* Validation Messages */}
          {amount && (
            <div className="mt-2">
              {activeTab === 'stake' && !stakeValidation.canStake && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AiOutlineWarning />
                  {stakeValidation.reason}
                </div>
              )}
              {activeTab === 'unstake' && !unstakeValidation.canUnstake && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AiOutlineWarning />
                  {unstakeValidation.reason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Projections */}
        {projections && amount && (
          <div className="mb-6">
            <button
              onClick={() => setShowProjections(!showProjections)}
              className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors mb-3"
            >
              <AiOutlineCalculator />
              Projected Earnings
              <AiOutlineInfoCircle className="text-xs" />
            </button>

            {showProjections && (
              <div className="bg-neutral-700/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Daily:</span>
                  <span className="text-gray-100">
                    {microAlgosToAlgos(projections.daily).toFixed(6)} {poolData.assetName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Weekly:</span>
                  <span className="text-gray-100">
                    {microAlgosToAlgos(projections.weekly).toFixed(6)} {poolData.assetName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly:</span>
                  <span className="text-gray-100">
                    {microAlgosToAlgos(projections.monthly).toFixed(6)} {poolData.assetName}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-neutral-600 pt-2">
                  <span className="text-gray-400">Yearly:</span>
                  <span className="text-green-400 font-semibold">
                    {microAlgosToAlgos(projections.yearly).toFixed(6)} {poolData.assetName}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={activeTab === 'stake' ? handleStake : handleUnstake}
          disabled={
            !activeAddress ||
            !amount ||
            isNaN(Number(amount)) ||
            Number(amount) <= 0 ||
            staking ||
            unstaking ||
            (activeTab === 'stake' && !stakeValidation.canStake) ||
            (activeTab === 'unstake' && !unstakeValidation.canUnstake)
          }
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2
            ${
              activeTab === 'stake'
                ? 'bg-green-500 hover:bg-green-600 disabled:bg-neutral-600'
                : 'bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-600'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {staking || unstaking ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin" />
              {activeTab === 'stake' ? 'Staking...' : 'Unstaking...'}
            </>
          ) : (
            <>
              <AiOutlineSend />
              {activeTab === 'stake' ? 'Stake' : 'Unstake'} {poolData.assetName}
            </>
          )}
        </button>

        {/* Wallet Connection Prompt */}
        {!activeAddress && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AiOutlineInfoCircle />
              Please connect your wallet to start staking
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
