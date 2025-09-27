import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { StakingPoolData, UserStakeInfo, TransactionStatus } from '../types/vault'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { calculateAPY, calculateProjectedEarnings } from '../utils/vault/yieldCalculations'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

interface UseStakingPoolReturn {
  // Pool data
  poolData: StakingPoolData | null
  userStake: UserStakeInfo | null

  // Loading states
  loading: boolean
  staking: boolean
  unstaking: boolean
  claiming: boolean

  // Error handling
  error: string | null

  // Actions
  stake: (amount: bigint) => Promise<string | null>
  unstake: (amount: bigint) => Promise<string | null>
  claimRewards: () => Promise<string | null>
  emergencyWithdraw: () => Promise<string | null>

  // Utilities
  refreshData: () => Promise<void>
  calculateProjections: (amount: bigint) => ReturnType<typeof calculateProjectedEarnings>
  canStake: (amount: bigint) => { canStake: boolean; reason?: string }
  canUnstake: (amount: bigint) => { canUnstake: boolean; reason?: string }
}

export function useStakingPool(poolId: string): UseStakingPoolReturn {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // State
  const [poolData, setPoolData] = useState<StakingPoolData | null>(null)
  const [userStake, setUserStake] = useState<UserStakeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [staking, setStaking] = useState(false)
  const [unstaking, setUnstaking] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Algorand client
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig])

  // Set default signer when wallet is connected
  useEffect(() => {
    if (transactionSigner) {
      algorand.setDefaultSigner(transactionSigner)
    }
  }, [algorand, transactionSigner])

  // Fetch pool data and user stake
  const refreshData = useCallback(async () => {
    if (!poolId) return

    try {
      setError(null)
      setLoading(true)

      // TODO: Replace with actual contract calls
      // This is a mock implementation - replace with real StakingPool client calls
      const mockPoolData: StakingPoolData = {
        id: poolId,
        assetId: 0, // ALGO
        assetName: 'ALGO',
        totalStaked: BigInt('50000000000'), // 50,000 ALGO
        rewardRate: BigInt('1000'), // 0.1% per second
        apy: calculateAPY(BigInt('1000')),
        participants: 156,
        minimumStake: BigInt('1000000'), // 1 ALGO
        maxStakePerUser: BigInt('1000000000000'), // 1M ALGO
        lockupPeriod: 0,
        earlyWithdrawPenalty: 0,
        poolActive: true,
        emergencyPaused: false,
        lastUpdateTime: Date.now(),
      }

      setPoolData(mockPoolData)

      // Fetch user stake if wallet is connected
      if (activeAddress) {
        const mockUserStake: UserStakeInfo = {
          amount: BigInt('5000000'), // 5 ALGO
          rewardDebt: BigInt('0'),
          lastStakeTime: Date.now() - 86400000, // 1 day ago
          pendingRewards: BigInt('25000'), // 0.025 ALGO
          claimableRewards: BigInt('25000'),
          hasAutoCompound: false,
          stakedAmount: 0n,
        }

        setUserStake(mockUserStake)
      } else {
        setUserStake(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pool data'
      setError(errorMessage)
      enqueueSnackbar(errorMessage, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [poolId, activeAddress, algorand, enqueueSnackbar])

  // Load data on mount and when dependencies change
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Stake function
  const stake = useCallback(
    async (amount: bigint): Promise<string | null> => {
      if (!activeAddress || !transactionSigner || !poolData) {
        enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
        return null
      }

      const validation = canStake(amount)
      if (!validation.canStake) {
        enqueueSnackbar(validation.reason || 'Cannot stake this amount', { variant: 'error' })
        return null
      }

      try {
        setStaking(true)
        setError(null)

        enqueueSnackbar('Staking transaction initiated...', { variant: 'info' })

        // TODO: Replace with actual StakingPool contract call
        const result = await algorand.send.payment({
          sender: activeAddress,
          receiver: activeAddress, // Mock - replace with pool address

          // amount: amount,
          signer: transactionSigner,
          amount: new AlgoAmount({ microAlgos: amount }),
        })

        const txId = result.txIds[0]

        enqueueSnackbar(`Successfully staked! Transaction ID: ${txId.substring(0, 8)}...`, {
          variant: 'success',
        })

        // Refresh data after successful stake
        await refreshData()

        return txId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Staking failed'
        setError(errorMessage)
        enqueueSnackbar(`Staking failed: ${errorMessage}`, { variant: 'error' })
        return null
      } finally {
        setStaking(false)
      }
    },
    [activeAddress, transactionSigner, poolData, algorand, enqueueSnackbar, refreshData],
  )

  // Unstake function
  const unstake = useCallback(
    async (amount: bigint): Promise<string | null> => {
      if (!activeAddress || !transactionSigner || !userStake) {
        enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
        return null
      }

      const validation = canUnstake(amount)
      if (!validation.canUnstake) {
        enqueueSnackbar(validation.reason || 'Cannot unstake this amount', { variant: 'error' })
        return null
      }

      try {
        setUnstaking(true)
        setError(null)

        enqueueSnackbar('Unstaking transaction initiated...', { variant: 'info' })

        // TODO: Replace with actual StakingPool contract call
        const result = await algorand.send.payment({
          sender: activeAddress,
          receiver: activeAddress, // Mock

          //amount: 1000, // Mock fee
          signer: transactionSigner,
          amount: new AlgoAmount({ microAlgos: amount }),
        })

        const txId = result.txIds[0]

        enqueueSnackbar(`Successfully unstaked! Transaction ID: ${txId.substring(0, 8)}...`, {
          variant: 'success',
        })

        // Refresh data after successful unstake
        await refreshData()

        return txId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unstaking failed'
        setError(errorMessage)
        enqueueSnackbar(`Unstaking failed: ${errorMessage}`, { variant: 'error' })
        return null
      } finally {
        setUnstaking(false)
      }
    },
    [activeAddress, transactionSigner, userStake, algorand, enqueueSnackbar, refreshData],
  )

  // Claim rewards function
  const claimRewards = useCallback(async (): Promise<string | null> => {
    if (!activeAddress || !transactionSigner || !userStake) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return null
    }

    if (userStake.claimableRewards <= 0n) {
      enqueueSnackbar('No rewards available to claim', { variant: 'warning' })
      return null
    }

    try {
      setClaiming(true)
      setError(null)

      enqueueSnackbar('Claiming rewards...', { variant: 'info' })

      // TODO: Replace with actual StakingPool contract call
      const result = await algorand.send.payment({
        sender: activeAddress,
        receiver: activeAddress, // Mock

        // amount: 1000, // Mock fee
        signer: transactionSigner,
        amount: new AlgoAmount({ microAlgos: userStake.claimableRewards }),
      })

      const txId = result.txIds[0]

      enqueueSnackbar(`Successfully claimed rewards! Transaction ID: ${txId.substring(0, 8)}...`, {
        variant: 'success',
      })

      // Refresh data after successful claim
      await refreshData()

      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Claiming rewards failed'
      setError(errorMessage)
      enqueueSnackbar(`Claiming failed: ${errorMessage}`, { variant: 'error' })
      return null
    } finally {
      setClaiming(false)
    }
  }, [activeAddress, transactionSigner, userStake, algorand, enqueueSnackbar, refreshData])

  // Emergency withdraw function
  const emergencyWithdraw = useCallback(async (): Promise<string | null> => {
    if (!activeAddress || !transactionSigner || !userStake) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return null
    }

    if (userStake.amount <= 0n) {
      enqueueSnackbar('No staked amount to withdraw', { variant: 'warning' })
      return null
    }

    try {
      setUnstaking(true)
      setError(null)

      enqueueSnackbar('Emergency withdrawal initiated...', { variant: 'warning' })

      // TODO: Replace with actual StakingPool contract call
      const result = await algorand.send.payment({
        sender: activeAddress,
        receiver: activeAddress, // Mock

        // amount: 1000, // Mock fee
        signer: transactionSigner,
        amount: new AlgoAmount({ microAlgos: userStake.amount }),
      })

      const txId = result.txIds[0]

      enqueueSnackbar(`Emergency withdrawal successful! Transaction ID: ${txId.substring(0, 8)}...`, {
        variant: 'success',
      })

      // Refresh data after successful withdrawal
      await refreshData()

      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Emergency withdrawal failed'
      setError(errorMessage)
      enqueueSnackbar(`Emergency withdrawal failed: ${errorMessage}`, { variant: 'error' })
      return null
    } finally {
      setUnstaking(false)
    }
  }, [activeAddress, transactionSigner, userStake, algorand, enqueueSnackbar, refreshData])

  // Calculate projections
  const calculateProjections = useCallback(
    (amount: bigint) => {
      if (!poolData) {
        return { daily: 0n, weekly: 0n, monthly: 0n, yearly: 0n }
      }

      return calculateProjectedEarnings(amount, poolData.apy)
    },
    [poolData],
  )

  // Validation functions
  const canStake = useCallback(
    (amount: bigint): { canStake: boolean; reason?: string } => {
      if (!poolData) {
        return { canStake: false, reason: 'Pool data not loaded' }
      }

      if (!poolData.poolActive) {
        return { canStake: false, reason: 'Pool is not active' }
      }

      if (poolData.emergencyPaused) {
        return { canStake: false, reason: 'Pool is paused for emergency' }
      }

      if (amount < poolData.minimumStake) {
        return { canStake: false, reason: `Minimum stake is ${Number(poolData.minimumStake) / 1e6} ALGO` }
      }

      if (userStake && userStake.amount + amount > poolData.maxStakePerUser) {
        return { canStake: false, reason: 'Exceeds maximum stake per user' }
      }

      return { canStake: true }
    },
    [poolData, userStake],
  )

  const canUnstake = useCallback(
    (amount: bigint): { canUnstake: boolean; reason?: string } => {
      if (!userStake) {
        return { canUnstake: false, reason: 'No staked amount found' }
      }

      if (amount > userStake.amount) {
        return { canUnstake: false, reason: 'Amount exceeds staked balance' }
      }

      if (amount <= 0n) {
        return { canUnstake: false, reason: 'Amount must be greater than 0' }
      }

      // Check lockup period if applicable
      if (userStake.lockupEndTime && Date.now() < userStake.lockupEndTime) {
        return { canUnstake: false, reason: 'Funds are still locked up' }
      }

      return { canUnstake: true }
    },
    [userStake],
  )

  return {
    poolData,
    userStake,
    loading,
    staking,
    unstaking,
    claiming,
    error,
    stake,
    unstake,
    claimRewards,
    emergencyWithdraw,
    refreshData,
    calculateProjections,
    canStake,
    canUnstake,
  }
}
