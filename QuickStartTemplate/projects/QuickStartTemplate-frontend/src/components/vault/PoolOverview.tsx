import React, { useState } from 'react'
import {
  AiOutlineInfoCircle,
  AiOutlineLineChart,
  AiOutlineFire,
  //AiOutlineShield,
  AiOutlineClockCircle,
  AiOutlineUsergroupAdd,
} from 'react-icons/ai'
import { BsCoin, BsGraphUp, BsLightning } from 'react-icons/bs'
import { StakingPoolData, PoolMetrics } from '../../types/vault'
import { microAlgosToAlgos, formatLargeNumber, calculateAPY } from '../../utils/vault/yieldCalculations'

interface PoolOverviewProps {
  poolData: StakingPoolData
  metrics?: PoolMetrics
  onStakeClick?: () => void
  onInfoClick?: () => void
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change?: number
  changeLabel?: string
  tooltip?: string
  highlight?: boolean
}

function StatCard({ icon, label, value, change, changeLabel, tooltip, highlight }: StatCardProps) {
  return (
    <div
      className={`
      bg-neutral-700/50 rounded-lg p-4 transition-all duration-300 hover:bg-neutral-700/70
      ${highlight ? 'ring-2 ring-cyan-400/30 bg-cyan-500/5' : ''}
    `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`text-lg ${highlight ? 'text-cyan-400' : 'text-gray-400'}`}>{icon}</div>
          <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
          {tooltip && (
            <div className="group relative">
              <AiOutlineInfoCircle className="text-xs text-gray-500 cursor-help" />
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
                <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">{tooltip}</div>
              </div>
            </div>
          )}
        </div>

        {change !== undefined && (
          <div className={`text-xs font-medium ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {change > 0 && '+'}
            {change.toFixed(2)}%{changeLabel && <div className="text-gray-500">{changeLabel}</div>}
          </div>
        )}
      </div>

      <div className={`text-lg font-bold ${highlight ? 'text-cyan-400' : 'text-gray-100'}`}>{value}</div>
    </div>
  )
}

export default function PoolOverview({ poolData, metrics, onStakeClick, onInfoClick }: PoolOverviewProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate derived metrics
  const tvlUSD = microAlgosToAlgos(poolData.totalStaked) * 0.25 // Mock ALGO price at $0.25
  const averageStake = poolData.participants > 0 ? microAlgosToAlgos(poolData.totalStaked) / poolData.participants : 0

  // Pool status indicator
  const getStatusColor = () => {
    if (!poolData.poolActive) return 'text-red-400'
    if (poolData.emergencyPaused) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusText = () => {
    if (!poolData.poolActive) return 'Inactive'
    if (poolData.emergencyPaused) return 'Paused'
    return 'Active'
  }

  return (
    <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <BsCoin className="text-2xl text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                {poolData.assetName} Staking Pool
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()} bg-current/10`}>{getStatusText()}</span>
              </h2>
              <p className="text-sm text-gray-400">Pool ID: {poolData.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {onInfoClick && (
              <button onClick={onInfoClick} className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
                <AiOutlineInfoCircle className="text-lg" />
              </button>
            )}
            {onStakeClick && poolData.poolActive && !poolData.emergencyPaused && (
              <button
                onClick={onStakeClick}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300 transform active:scale-95"
              >
                Stake Now
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<BsGraphUp />}
            label="APY"
            value={`${poolData.apy.toFixed(2)}%`}
            highlight
            tooltip="Annual Percentage Yield including compound effects"
          />
          <StatCard
            icon={<BsCoin />}
            label="Total Value Locked"
            value={`${formatLargeNumber(microAlgosToAlgos(poolData.totalStaked))} ${poolData.assetName}`}
            change={metrics?.performance7d}
            changeLabel="7d"
            tooltip="Total amount staked in this pool"
          />
          <StatCard
            icon={<AiOutlineUsergroupAdd />}
            label="Participants"
            value={poolData.participants.toLocaleString()}
            tooltip="Number of unique stakers in this pool"
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">Pool Statistics</h3>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<BsLightning />}
            label="Reward Rate"
            value={`${((Number(poolData.rewardRate) / 1e12) * 100).toFixed(4)}%/sec`}
            tooltip="Reward rate per second per unit staked"
          />
          <StatCard
            icon={<AiOutlineFire />}
            label="Min Stake"
            value={`${microAlgosToAlgos(poolData.minimumStake)} ${poolData.assetName}`}
            tooltip="Minimum amount required to stake"
          />
          <StatCard
            icon={<AiOutlineLineChart />}
            label="Avg Stake Size"
            value={`${averageStake.toFixed(2)} ${poolData.assetName}`}
            tooltip="Average stake size per participant"
          />
          <StatCard
            icon={<AiOutlineFire />}
            label="TVL (USD)"
            value={`$${formatLargeNumber(tvlUSD)}`}
            tooltip="Total Value Locked in USD (estimated)"
          />
        </div>

        {/* Advanced Metrics */}
        {showAdvanced && metrics && (
          <div className="border-t border-neutral-700 pt-6">
            <h4 className="text-md font-medium text-gray-300 mb-4">Advanced Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatCard
                icon={<AiOutlineLineChart />}
                label="Utilization"
                value={`${metrics.utilization.toFixed(1)}%`}
                tooltip="Pool utilization rate"
              />
              <StatCard
                icon={<AiOutlineFire />}
                label="Risk Score"
                value={`${metrics.riskScore}/100`}
                tooltip="Risk assessment score (lower is safer)"
              />
              <StatCard
                icon={<BsGraphUp />}
                label="Efficiency"
                value={`${metrics.efficiency.toFixed(1)}%`}
                tooltip="Pool efficiency rating"
              />
              <StatCard
                icon={<AiOutlineClockCircle />}
                label="Performance 30d"
                value={`${metrics.performance30d > 0 ? '+' : ''}${metrics.performance30d.toFixed(2)}%`}
                tooltip="30-day performance"
              />
            </div>

            {/* Volume and Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={<BsGraphUp />}
                label="24h Volume"
                value={`${formatLargeNumber(microAlgosToAlgos(metrics.volume24h))} ${poolData.assetName}`}
                tooltip="Trading volume in the last 24 hours"
              />
              <StatCard
                icon={<BsCoin />}
                label="24h Fees"
                value={`${formatLargeNumber(microAlgosToAlgos(metrics.fees24h))} ${poolData.assetName}`}
                tooltip="Fees collected in the last 24 hours"
              />
            </div>
          </div>
        )}

        {/* Pool Configuration */}
        <div className="border-t border-neutral-700 pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-300 mb-4">Pool Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {poolData.lockupPeriod > 0 && (
              <div className="bg-neutral-700/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Lockup Period</div>
                <div className="text-sm font-medium text-gray-200">{Math.floor(poolData.lockupPeriod / 86400)} days</div>
              </div>
            )}

            {poolData.earlyWithdrawPenalty > 0 && (
              <div className="bg-neutral-700/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Early Withdraw Penalty</div>
                <div className="text-sm font-medium text-orange-400">{poolData.earlyWithdrawPenalty}%</div>
              </div>
            )}

            <div className="bg-neutral-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Max Stake Per User</div>
              <div className="text-sm font-medium text-gray-200">
                {microAlgosToAlgos(poolData.maxStakePerUser) >= 1000000
                  ? 'Unlimited'
                  : `${formatLargeNumber(microAlgosToAlgos(poolData.maxStakePerUser))} ${poolData.assetName}`}
              </div>
            </div>
          </div>
        </div>

        {/* Warnings and Notices */}
        {(poolData.emergencyPaused || !poolData.poolActive) && (
          <div className="border-t border-neutral-700 pt-6 mt-6">
            <div
              className={`
              p-4 rounded-lg border-l-4 
              ${
                poolData.emergencyPaused
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-200'
                  : 'bg-red-500/10 border-red-500 text-red-200'
              }
            `}
            >
              <div className="flex items-center gap-2 font-medium mb-1">
                <AiOutlineInfoCircle />
                {poolData.emergencyPaused ? 'Pool Paused' : 'Pool Inactive'}
              </div>
              <div className="text-sm opacity-90">
                {poolData.emergencyPaused
                  ? 'This pool is temporarily paused for maintenance or security reasons. Existing stakes are safe.'
                  : 'This pool is currently inactive. No new stakes are being accepted.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
