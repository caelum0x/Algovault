import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import {
  BsArrowDownUp,
  BsGear,
  BsLightning,
  BsShield,
  BsGraphUp,
  BsRobot,
  BsClock,
  BsArrowRight
} from 'react-icons/bs'
import { getAITinymanService } from '../../services/tinyman/aiTinymanService'
import { getTinymanService } from '../../services/tinyman/tinymanService'
import { SwapQuote, AISwapStrategy } from '../../services/tinyman/types'

interface AdvancedSwapProps {
  openModal: boolean
  closeModal: () => void
}

interface AssetInfo {
  id: number
  symbol: string
  name: string
  decimals: number
  balance?: bigint
}

interface SwapSettings {
  slippage: number
  useAI: boolean
  strategy: 'instant' | 'optimal-timing' | 'dca' | 'twap'
  deadline: number
}

const AdvancedSwap = ({ openModal, closeModal }: AdvancedSwapProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // State
  const [assetIn, setAssetIn] = useState<AssetInfo>({ id: 0, symbol: 'ALGO', name: 'Algorand', decimals: 6 })
  const [assetOut, setAssetOut] = useState<AssetInfo>({ id: 31566704, symbol: 'USDC', name: 'USD Coin', decimals: 6 })
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [aiStrategy, setAiStrategy] = useState<AISwapStrategy | null>(null)
  const [settings, setSettings] = useState<SwapSettings>({
    slippage: 0.5,
    useAI: true,
    strategy: 'optimal-timing',
    deadline: 20
  })
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const tinymanService = getTinymanService()
  const aiService = getAITinymanService()

  // Popular assets for quick selection
  const popularAssets = [
    { id: 0, symbol: 'ALGO', name: 'Algorand', decimals: 6 },
    { id: 31566704, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { id: 312769, symbol: 'USDT', name: 'Tether', decimals: 6 },
    { id: 465865291, symbol: 'STBL', name: 'Stable Coin', decimals: 6 }
  ]

  useEffect(() => {
    if (amountIn && assetIn && assetOut) {
      getQuote()
    }
  }, [amountIn, assetIn, assetOut, settings.slippage])

  const getQuote = async () => {
    if (!amountIn || !assetIn || !assetOut) return

    try {
      setLoading(true)
      const amount = BigInt(parseFloat(amountIn) * Math.pow(10, assetIn.decimals))

      // Get basic quote
      const basicQuote = await tinymanService.getSwapQuote(
        assetIn.id,
        assetOut.id,
        amount,
        settings.slippage / 100
      )
      setQuote(basicQuote)

      // Get AI strategy if enabled
      if (settings.useAI) {
        const strategy = await aiService.getAISwapStrategy(
          assetIn.id,
          assetOut.id,
          amount
        )
        setAiStrategy(strategy)
      }

      // Calculate output amount
      const outputAmount = basicQuote.amountOut / BigInt(Math.pow(10, assetOut.decimals))
      setAmountOut(outputAmount.toString())

    } catch (error) {
      console.error('Failed to get quote:', error)
      enqueueSnackbar('Failed to get quote', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const executeSwap = async () => {
    if (!activeAddress || !transactionSigner || !quote) {
      enqueueSnackbar('Please connect wallet and get a quote first', { variant: 'warning' })
      return
    }

    try {
      setLoading(true)
      enqueueSnackbar('Executing swap...', { variant: 'info' })

      const amount = BigInt(parseFloat(amountIn) * Math.pow(10, assetIn.decimals))

      let result
      if (settings.useAI && aiStrategy) {
        result = await aiService.executeAISwap(
          assetIn.id,
          assetOut.id,
          amount,
          activeAddress,
          transactionSigner,
          aiStrategy
        )
      } else {
        result = await tinymanService.executeSwap(
          assetIn.id,
          assetOut.id,
          amount,
          quote.minimumAmountOut,
          activeAddress,
          transactionSigner
        )
      }

      enqueueSnackbar(`Swap completed! TxID: ${result.txId?.[0] || 'Success'}`, { variant: 'success' })
      resetForm()

    } catch (error: any) {
      console.error('Swap failed:', error)
      enqueueSnackbar(`Swap failed: ${error.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const swapAssets = () => {
    const tempAsset = assetIn
    setAssetIn(assetOut)
    setAssetOut(tempAsset)
    setAmountIn(amountOut)
    setAmountOut('')
  }

  const resetForm = () => {
    setAmountIn('')
    setAmountOut('')
    setQuote(null)
    setAiStrategy(null)
  }

  const formatNumber = (num: number, decimals: number = 4) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'optimal-timing': return <BsClock className="text-blue-400" />
      case 'dca': return <BsGraphUp className="text-green-400" />
      case 'twap': return <BsLightning className="text-yellow-400" />
      default: return <BsArrowRight className="text-gray-400" />
    }
  }

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'optimal-timing': return 'AI optimizes execution timing'
      case 'dca': return 'Dollar-cost averaging over time'
      case 'twap': return 'Time-weighted average price execution'
      default: return 'Immediate execution'
    }
  }

  return (
    <dialog
      id="advanced_swap_modal"
      className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}
    >
      <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-6 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            <BsLightning className="inline mr-2" />
            AI-Powered Swap
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
            >
              <BsGear />
            </button>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BsGear />
              Swap Settings
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Slippage Tolerance (%)</label>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0, 3.0].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSettings(prev => ({ ...prev, slippage: value }))}
                      className={`btn btn-sm ${
                        settings.slippage === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-600 text-gray-300'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.useAI}
                    onChange={(e) => setSettings(prev => ({ ...prev, useAI: e.target.checked }))}
                    className="checkbox checkbox-primary"
                  />
                  <span>Use AI Optimization</span>
                  <BsRobot className="text-purple-400" />
                </label>
              </div>

              {settings.useAI && (
                <div>
                  <label className="block text-sm font-medium mb-2">AI Strategy</label>
                  <select
                    value={settings.strategy}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      strategy: e.target.value as any
                    }))}
                    className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded-lg text-white"
                  >
                    <option value="instant">Instant Execution</option>
                    <option value="optimal-timing">Optimal Timing</option>
                    <option value="dca">Dollar-Cost Averaging</option>
                    <option value="twap">TWAP Strategy</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {getStrategyDescription(settings.strategy)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Swap Interface */}
        <div className="space-y-4">
          {/* From Asset */}
          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">Balance: --</span>
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
              />

              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-600 rounded-lg">
                <span className="font-medium">{assetIn.symbol}</span>
              </div>
            </div>

            {/* Quick Asset Selection */}
            <div className="flex gap-2 mt-3">
              {popularAssets.filter(asset => asset.id !== assetOut.id).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setAssetIn(asset)}
                  className={`btn btn-xs ${
                    assetIn.id === asset.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-600 text-gray-300'
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapAssets}
              className="btn btn-circle bg-neutral-700 border-neutral-600 hover:bg-neutral-600 text-white"
            >
              <BsArrowDownUp />
            </button>
          </div>

          {/* To Asset */}
          <div className="p-4 bg-neutral-700 rounded-lg border border-neutral-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">Balance: --</span>
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                value={amountOut}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
              />

              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-600 rounded-lg">
                <span className="font-medium">{assetOut.symbol}</span>
              </div>
            </div>

            {/* Quick Asset Selection */}
            <div className="flex gap-2 mt-3">
              {popularAssets.filter(asset => asset.id !== assetIn.id).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setAssetOut(asset)}
                  className={`btn btn-xs ${
                    assetOut.id === asset.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-600 text-gray-300'
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Quote Information */}
          {quote && (
            <div className="p-4 bg-neutral-750 rounded-lg border border-neutral-600">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BsGraphUp />
                Swap Details
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-green-400'}>
                    {formatNumber(quote.priceImpact, 2)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Minimum Received</span>
                  <span>{formatNumber(Number(quote.minimumAmountOut) / Math.pow(10, assetOut.decimals))} {assetOut.symbol}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Network Fee</span>
                  <span>{formatNumber(Number(quote.fees) / 1000000, 6)} ALGO</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Strategy Information */}
          {settings.useAI && aiStrategy && (
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BsRobot className="text-purple-400" />
                AI Strategy: {aiStrategy.type.replace('-', ' ').toUpperCase()}
              </h4>

              <div className="flex items-center gap-2 mb-2">
                {getStrategyIcon(aiStrategy.type)}
                <span className="text-sm">{aiStrategy.aiRecommendation}</span>
              </div>

              <div className="flex items-center gap-2">
                <BsShield className="text-green-400" />
                <span className="text-sm">Confidence: {formatNumber(aiStrategy.confidence * 100)}%</span>
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={executeSwap}
            disabled={!amountIn || !quote || loading || !activeAddress}
            className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none text-white text-lg py-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </div>
            ) : !activeAddress ? (
              'Connect Wallet'
            ) : (
              `Swap ${assetIn.symbol} → ${assetOut.symbol}`
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default AdvancedSwap