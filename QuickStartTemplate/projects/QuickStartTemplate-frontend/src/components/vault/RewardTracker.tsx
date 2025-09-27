import React, { useState, useEffect } from 'react'
import {
  AiOutlineGift,
  AiOutlineLoading3Quarters,
  AiOutlineHistory,
  AiOutlineLineChart,
  AiOutlineCalendar,
  AiOutlineTrophy,
  AiOutlineClockCircle,
} from 'react-icons/ai'
import { BsCoin, BsGraphUp, BsArrowUpCircle } from 'react-icons/bs'
import { UserStakeInfo, RewardHistory, StakingPoolData } from '../../types/vault'
import { microAlgosToAlgos, formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface RewardTrackerProps {
  poolData: StakingPoolData
  userStake: UserStakeInfo | null
  onClaimRewards: () => Promise<string | null>
  claiming: boolean
}

interface RewardStats {
  totalEarned: bigint
  totalClaimed: bigint
  averageDailyReward: bigint
  bestDay: bigint
  streakDays: number
  efficiency: number
}

export default function RewardTracker({ poolData, userStake, onClaimRewards, claiming }: RewardTrackerProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'projections'>('current')
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([])
  const [rewardStats, setRewardStats] = useState<RewardStats | null>(null)
  const [realTimeRewards, setRealTimeRewards] = useState<bigint>(0n)

  // Mock reward history data - in real implementation, fetch from API/contract
  useEffect(() => {
    if (userStake) {
      const mockHistory: RewardHistory[] = [
        {
          timestamp: Date.now() - 86400000,
          type: 'claim',
          amount: BigInt('50000'), // 0.05 ALGO
          txId: 'ABC123...',
          blockHeight: 12345678,
        },
        {
          timestamp: Date.now() - 172800000,
          type: 'compound',
          amount: BigInt('30000'), // 0.03 ALGO
          txId: 'DEF456...',
          blockHeight: 12345600,
        },
        {
          timestamp: Date.now() - 259200000,
          type: 'claim',
          amount: BigInt('75000'), // 0.075 ALGO
          txId: 'GHI789...',
          blockHeight: 12345500,
        },
      ]

      setRewardHistory(mockHistory)

      // Calculate stats
      const totalEarned = mockHistory.reduce((sum, reward) => sum + reward.amount, 0n)
      const claimedRewards = mockHistory.filter((r) => r.type === 'claim')
      const totalClaimed = claimedRewards.reduce((sum, reward) => sum + reward.amount, 0n)

      setRewardStats({
        totalEarned,
        totalClaimed,
        averageDailyReward: BigInt('25000'), // Mock average
        bestDay: BigInt('75000'), // Mock best day
        streakDays: 7, // Mock streak
        efficiency: 94.5, // Mock efficiency
      })
    }
  }, [userStake])

  // Real-time reward updates
  useEffect(() => {
    if (!userStake) return

    const interval = setInterval(() => {
      // Mock real-time reward accumulation
      setRealTimeRewards((prev) => prev + BigInt('100')) // +0.0001 ALGO per second
    }, 1000)

    return () => clearInterval(interval)
  }, [userStake])

  // Calculate time-based projections
  const calculateProjections = () => {
    if (!userStake || !poolData) return null

    const stakingRate = Number(poolData.rewardRate) / 1e12
    const stakedAmount = Number(userStake.amount)
    const secondsPerDay = 86400
    const secondsPerWeek = 604800
    const secondsPerMonth = 2629746

    return {
      nextHour: BigInt(Math.floor(stakedAmount * stakingRate * 3600)),
      nextDay: BigInt(Math.floor(stakedAmount * stakingRate * secondsPerDay)),
      nextWeek: BigInt(Math.floor(stakedAmount * stakingRate * secondsPerWeek)),
      nextMonth: BigInt(Math.floor(stakedAmount * stakingRate * secondsPerMonth)),
    }
  }

  const projections = calculateProjections()

  if (!userStake) {
    return (
      <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AiOutlineGift className="text-4xl text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Active Stakes</h3>
            <p className="text-sm text-gray-500">Start staking to track your rewards and earnings</p>
          </div>
        </div>
      </div>
    )
  }

  const canClaim = userStake.claimableRewards > 0n
  const pendingTotal = userStake.pendingRewards + realTimeRewards

  return (
    <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <AiOutlineGift className="text-2xl text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100">Reward Tracker</h3>
              <p className="text-sm text-gray-400">Track and claim your staking rewards</p>
            </div>
          </div>

          <button
            onClick={onClaimRewards}
            disabled={!canClaim || claiming}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300 transform active:scale-95 flex items-center gap-2
              ${canClaim ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-neutral-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            {claiming ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <BsArrowUpCircle />
                Claim Rewards
              </>
            )}
          </button>
        </div>

        {/* Current Rewards Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <BsCoin />
              <span className="text-sm font-medium">Pending Rewards</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              {microAlgosToAlgos(pendingTotal).toFixed(6)} {poolData.assetName}
            </div>
            <div className="text-xs text-green-300/70 mt-1">+{microAlgosToAlgos(realTimeRewards).toFixed(6)} this session</div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <AiOutlineClockCircle />
              <span className="text-sm font-medium">Claimable Now</span>
            </div>
            <div className="text-xl font-bold text-blue-400">
              {microAlgosToAlgos(userStake.claimableRewards).toFixed(6)} {poolData.assetName}
            </div>
            <div className="text-xs text-blue-300/70 mt-1">Ready for withdrawal</div>
          </div>

          {rewardStats && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <AiOutlineTrophy />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <div className="text-xl font-bold text-purple-400">
                {microAlgosToAlgos(rewardStats.totalEarned).toFixed(6)} {poolData.assetName}
              </div>
              <div className="text-xs text-purple-300/70 mt-1">All-time earnings</div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-700">
        {[
          { key: 'current', label: 'Current', icon: <BsCoin /> },
          { key: 'history', label: 'History', icon: <AiOutlineHistory /> },
          { key: 'projections', label: 'Projections', icon: <AiOutlineLineChart /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.key ? 'text-cyan-400 border-b-2 border-cyan-400 bg-neutral-700/50' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'current' && rewardStats && (
          <div className="space-y-6">
            {/* Reward Rate Info */}
            <div className="bg-neutral-700/30 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-300 mb-3">Current Earning Rate</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Per Second</div>
                  <div className="text-sm font-semibold text-gray-100">
                    {((Number(userStake.amount) * Number(poolData.rewardRate)) / 1e18).toFixed(8)} {poolData.assetName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Per Hour</div>
                  <div className="text-sm font-semibold text-gray-100">
                    {((Number(userStake.amount) * Number(poolData.rewardRate) * 3600) / 1e18).toFixed(6)} {poolData.assetName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Per Day</div>
                  <div className="text-sm font-semibold text-gray-100">
                    {((Number(userStake.amount) * Number(poolData.rewardRate) * 86400) / 1e18).toFixed(4)} {poolData.assetName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Efficiency</div>
                  <div className="text-sm font-semibold text-green-400">{rewardStats.efficiency}%</div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Average Daily</div>
                <div className="text-lg font-bold text-gray-100">
                  {microAlgosToAlgos(rewardStats.averageDailyReward).toFixed(6)} {poolData.assetName}
                </div>
              </div>
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Best Day</div>
                <div className="text-lg font-bold text-green-400">
                  {microAlgosToAlgos(rewardStats.bestDay).toFixed(6)} {poolData.assetName}
                </div>
              </div>
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Claiming Streak</div>
                <div className="text-lg font-bold text-orange-400">{rewardStats.streakDays} days</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-300">Reward History</h4>
              <div className="text-sm text-gray-400">Last {rewardHistory.length} transactions</div>
            </div>

            {rewardHistory.length === 0 ? (
              <div className="text-center py-8">
                <AiOutlineHistory className="text-3xl text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No reward history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewardHistory.map((reward, index) => (
                  <div key={index} className="bg-neutral-700/30 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          reward.type === 'claim'
                            ? 'bg-green-500/20 text-green-400'
                            : reward.type === 'compound'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {reward.type === 'claim' ? <BsArrowUpCircle /> : reward.type === 'compound' ? <BsGraphUp /> : <BsCoin />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200 capitalize">{reward.type} Reward</div>
                        <div className="text-xs text-gray-400">{new Date(reward.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-100">
                        +{microAlgosToAlgos(reward.amount).toFixed(6)} {poolData.assetName}
                      </div>
                      <div className="text-xs text-gray-400">{reward.txId.substring(0, 8)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projections' && projections && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <AiOutlineCalendar className="text-lg text-cyan-400" />
              <h4 className="text-md font-medium text-gray-300">Projected Earnings</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <div className="text-xs text-cyan-300 mb-1">Next Hour</div>
                <div className="text-xl font-bold text-cyan-400">
                  +{microAlgosToAlgos(projections.nextHour).toFixed(6)} {poolData.assetName}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="text-xs text-green-300 mb-1">Next Day</div>
                <div className="text-xl font-bold text-green-400">
                  +{microAlgosToAlgos(projections.nextDay).toFixed(6)} {poolData.assetName}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="text-xs text-purple-300 mb-1">Next Week</div>
                <div className="text-xl font-bold text-purple-400">
                  +{microAlgosToAlgos(projections.nextWeek).toFixed(6)} {poolData.assetName}
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="text-xs text-orange-300 mb-1">Next Month</div>
                <div className="text-xl font-bold text-orange-400">
                  +{microAlgosToAlgos(projections.nextMonth).toFixed(6)} {poolData.assetName}
                </div>
              </div>
            </div>

            {/* Compound Interest Comparison */}
            <div className="bg-neutral-700/30 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Auto-Compound vs Manual Claiming (1 Year)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Manual Claiming</div>
                  <div className="text-lg font-semibold text-gray-100">
                    +{microAlgosToAlgos(projections.nextMonth * 12n).toFixed(2)} {poolData.assetName}
                  </div>
                  <div className="text-xs text-gray-500">Linear growth</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Auto-Compound</div>
                  <div className="text-lg font-semibold text-green-400">
                    +{microAlgosToAlgos(BigInt(Math.floor(Number(projections.nextMonth * 12n) * 1.05))).toFixed(2)} {poolData.assetName}
                  </div>
                  <div className="text-xs text-green-500">~5% more with compounding</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
