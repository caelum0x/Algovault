import React, { useState, useEffect, useMemo } from 'react'
import { AiOutlineLineChart, AiOutlineWarning, AiOutlineDingding, AiOutlineInfoCircle, AiOutlineReload } from 'react-icons/ai'
import { BsCoin, BsGraphUp, BsPieChart } from 'react-icons/bs'
import { TVLChart, AnalyticsTimeframe, ChartDataPoint, MetricCard } from '../../types/analytics'
import { formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface TVLDashboardProps {
  onTimeframeChange?: (timeframe: AnalyticsTimeframe) => void
}

interface SimpleLineChartProps {
  data: ChartDataPoint[]
  height?: number
  color?: string
  showGrid?: boolean
}

function SimpleLineChart({ data, height = 200, color = '#06b6d4', showGrid = true }: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-neutral-700/30 rounded" style={{ height }}>
        <span className="text-gray-500">No data available</span>
      </div>
    )
  }

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))
  const valueRange = maxValue - minValue || 1

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((point.value - minValue) / valueRange) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
        {showGrid && (
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>
        )}

        {showGrid && <rect width="100" height="100" fill="url(#grid)" />}

        <polyline fill="none" stroke={color} strokeWidth="1" points={points} vectorEffect="non-scaling-stroke" />

        <polyline fill={`${color}20`} stroke="none" points={`0,100 ${points} 100,100`} />
      </svg>
    </div>
  )
}

function MetricCardComponent({ title, value, change, changeType, trend, format = 'number' }: MetricCard) {
  const formatValue = (val: string | number | bigint) => {
    if (format === 'currency') {
      return `$${formatLargeNumber(typeof val === 'bigint' ? Number(val) : Number(val))}`
    } else if (format === 'percentage') {
      return `${val}%`
    } else if (format === 'bigint') {
      return formatLargeNumber(Number(val))
    }
    return formatLargeNumber(typeof val === 'number' ? val : Number(val))
  }

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-400'
    if (changeType === 'negative') return 'text-red-400'
    return 'text-gray-400'
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') return <AiOutlineWarning />
    if (changeType === 'negative') return <AiOutlineDingding />
    return null
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-neutral-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</h3>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
            {getChangeIcon()}
            {change > 0 && '+'}
            {change.toFixed(2)}%
          </div>
        )}
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold text-gray-100">{formatValue(value)}</span>
      </div>

      {trend && trend.length > 0 && (
        <div className="h-12">
          <SimpleLineChart
            data={trend}
            height={48}
            color={changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#06b6d4'}
            showGrid={false}
          />
        </div>
      )}
    </div>
  )
}

export default function TVLDashboard({ onTimeframeChange }: TVLDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>({
    label: '7 Days',
    value: '7d',
    seconds: 604800,
  })
  const [tvlData, setTvlData] = useState<TVLChart | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const timeframes: AnalyticsTimeframe[] = [
    { label: '1H', value: '1h', seconds: 3600 },
    { label: '24H', value: '24h', seconds: 86400 },
    { label: '7D', value: '7d', seconds: 604800 },
    { label: '30D', value: '30d', seconds: 2592000 },
    { label: '90D', value: '90d', seconds: 7776000 },
    { label: '1Y', value: '1y', seconds: 31536000 },
  ]

  // Mock data generation
  const generateMockData = (timeframe: AnalyticsTimeframe): TVLChart => {
    const now = Date.now()
    const points = Math.min(100, Math.max(10, timeframe.seconds / 3600)) // 1 point per hour, capped
    const data: ChartDataPoint[] = []

    const baseTVL = 50000000 // 50M base TVL
    let currentTVL = baseTVL

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - (i * (timeframe.seconds * 1000)) / points

      // Add some realistic volatility
      const volatility = 0.02 // 2% volatility
      const change = (Math.random() - 0.5) * volatility
      currentTVL *= 1 + change

      // Add some trend based on timeframe
      if (timeframe.value === '1y' || timeframe.value === '90d') {
        currentTVL *= 1.0001 // Slight upward trend for longer periods
      }

      data.push({
        timestamp,
        value: currentTVL,
        volume: currentTVL * 0.1, // Volume is 10% of TVL
      })
    }

    const finalTVL = BigInt(Math.floor(currentTVL))
    const initialTVL = BigInt(Math.floor(data[0].value))
    const change24h = finalTVL - initialTVL
    const changePercent24h = Number((change24h * 100n) / initialTVL)

    return {
      current: finalTVL,
      change24h,
      changePercent24h,
      data,
    }
  }

  // Fetch TVL data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData = generateMockData(selectedTimeframe)
      setTvlData(mockData)
      setLastUpdate(new Date())
      setLoading(false)
    }

    fetchData()
  }, [selectedTimeframe])

  const handleTimeframeChange = (timeframe: AnalyticsTimeframe) => {
    setSelectedTimeframe(timeframe)
    onTimeframeChange?.(timeframe)
  }

  const refreshData = () => {
    if (!loading) {
      const mockData = generateMockData(selectedTimeframe)
      setTvlData(mockData)
      setLastUpdate(new Date())
    }
  }

  // Calculate additional metrics
  const additionalMetrics = useMemo(() => {
    if (!tvlData || tvlData.data.length === 0) return null

    const data = tvlData.data
    const volumes = data.map((d) => d.volume || 0)
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0)
    const avgVolume = totalVolume / volumes.length

    // Calculate volatility
    const returns = data.slice(1).map((point, i) => (point.value - data[i].value) / data[i].value)
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * 100

    // High and low
    const values = data.map((d) => d.value)
    const high = Math.max(...values)
    const low = Math.min(...values)

    return {
      volume: totalVolume,
      avgVolume,
      volatility,
      high,
      low,
      dataPoints: data.length,
    }
  }, [tvlData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <BsCoin className="text-cyan-400" />
            Total Value Locked (TVL)
          </h2>
          <p className="text-gray-400 mt-1">Track the total value locked across all AlgoVault pools</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <AiOutlineReload className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => handleTimeframeChange(timeframe)}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedTimeframe.value === timeframe.value ? 'bg-cyan-500 text-white' : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded mb-4"></div>
              <div className="h-8 bg-neutral-700 rounded mb-3"></div>
              <div className="h-12 bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        tvlData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCardComponent
              title="Current TVL"
              value={tvlData.current}
              format="bigint"
              change={tvlData.changePercent24h}
              changeType={tvlData.changePercent24h > 0 ? 'positive' : 'negative'}
              trend={tvlData.data}
            />

            <MetricCardComponent
              title="24h Change"
              value={tvlData.change24h}
              format="bigint"
              changeType={tvlData.changePercent24h > 0 ? 'positive' : 'negative'}
            />

            {additionalMetrics && (
              <>
                <MetricCardComponent title="Period High" value={additionalMetrics.high} format="number" changeType="neutral" />

                <MetricCardComponent title="Period Low" value={additionalMetrics.low} format="number" changeType="neutral" />
              </>
            )}
          </div>
        )
      )}

      {/* Main Chart */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <AiOutlineLineChart />
            TVL Over Time
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AiOutlineInfoCircle />
            {selectedTimeframe.label} view
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-neutral-700/30 rounded animate-pulse"></div>
        ) : (
          tvlData && (
            <div className="h-64">
              <SimpleLineChart data={tvlData.data} height={256} color="#06b6d4" showGrid={true} />
            </div>
          )
        )}
      </div>

      {/* Additional Analytics */}
      {additionalMetrics && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <BsGraphUp />
              Volume Analytics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Volume</span>
                <span className="text-gray-100 font-medium">{formatLargeNumber(additionalMetrics.volume)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Volume</span>
                <span className="text-gray-100 font-medium">{formatLargeNumber(additionalMetrics.avgVolume)}</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <BsPieChart />
              Risk Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility</span>
                <span
                  className={`font-medium ${
                    additionalMetrics.volatility > 5
                      ? 'text-red-400'
                      : additionalMetrics.volatility > 2
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {additionalMetrics.volatility.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Points</span>
                <span className="text-gray-100 font-medium">{additionalMetrics.dataPoints}</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                TVL has {tvlData && tvlData.changePercent24h > 0 ? 'increased' : 'decreased'} by{' '}
                <span className={tvlData && tvlData.changePercent24h > 0 ? 'text-green-400' : 'text-red-400'}>
                  {tvlData ? Math.abs(tvlData.changePercent24h).toFixed(2) : '0.00'}%
                </span>{' '}
                over the selected period.
              </p>
              <p className="text-gray-400">
                Current volatility is <span className="text-gray-300">{additionalMetrics.volatility.toFixed(2)}%</span>, indicating{' '}
                {additionalMetrics.volatility > 5 ? 'high' : additionalMetrics.volatility > 2 ? 'moderate' : 'low'} risk.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
