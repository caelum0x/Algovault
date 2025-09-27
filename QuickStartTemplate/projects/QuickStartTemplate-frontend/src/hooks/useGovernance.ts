import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { Proposal, Vote, VoteOption, ProposalStatus, ProposalType, GovernanceStats, VoterProfile } from '../types/governance'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

interface UseGovernanceReturn {
  // Data
  proposals: Proposal[]
  userVotes: { [proposalId: string]: Vote }
  userVotingPower: bigint
  governanceStats: GovernanceStats | null
  userProfile: VoterProfile | null

  // Loading states
  loading: boolean
  voting: boolean
  creating: boolean

  // Error handling
  error: string | null

  // Actions
  vote: (proposalId: string, option: VoteOption, reason?: string) => Promise<string | null>
  createProposal: (proposal: Omit<Proposal, 'id' | 'forVotes' | 'againstVotes' | 'abstainVotes' | 'status'>) => Promise<string | null>
  delegate: (delegate: string) => Promise<string | null>

  // Utilities
  refreshData: () => Promise<void>
  getProposal: (id: string) => Proposal | null
  hasVoted: (proposalId: string) => boolean
  canVote: (proposalId: string) => { canVote: boolean; reason?: string }
  calculateQuorumProgress: (proposalId: string) => number
}

export function useGovernance(): UseGovernanceReturn {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // State
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [userVotes, setUserVotes] = useState<{ [proposalId: string]: Vote }>({})
  const [userVotingPower, setUserVotingPower] = useState<bigint>(0n)
  const [governanceStats, setGovernanceStats] = useState<GovernanceStats | null>(null)
  const [userProfile, setUserProfile] = useState<VoterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [creating, setCreating] = useState(false)
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

  // Fetch governance data
  const refreshData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      // Mock governance data - replace with actual contract calls
      const mockProposals: Proposal[] = [
        {
          id: '1',
          proposer: 'WXYZ...1234',
          title: 'Increase Reward Rate for ALGO Pool',
          description:
            'Proposal to increase the reward rate from 10% to 12% APY for the main ALGO staking pool to attract more liquidity and improve competitiveness.',
          type: ProposalType.UpdateRewardRate,
          targetContract: 'ABCD...5678',
          executionData: '0x123456...',
          votingStartTime: Date.now() - 86400000, // 1 day ago
          votingEndTime: Date.now() + 518400000, // 6 days from now
          executionTime: Date.now() + 604800000, // 7 days from now
          forVotes: BigInt('15000000000'), // 15k ALGO worth of votes
          againstVotes: BigInt('3000000000'), // 3k ALGO worth of votes
          abstainVotes: BigInt('1000000000'), // 1k ALGO worth of votes
          status: ProposalStatus.Active,
          quorumRequired: 10, // 10%
          executed: false,
          cancelled: false,
          txId: 'PROP1...',
        },
        {
          id: '2',
          proposer: 'QWER...9876',
          title: 'Add Emergency Pause Feature',
          description:
            'Implement an emergency pause mechanism that allows governance to halt all protocol operations in case of security threats or bugs.',
          type: ProposalType.EmergencyAction,
          votingStartTime: Date.now() - 172800000, // 2 days ago
          votingEndTime: Date.now() + 432000000, // 5 days from now
          forVotes: BigInt('8000000000'), // 8k ALGO
          againstVotes: BigInt('12000000000'), // 12k ALGO
          abstainVotes: BigInt('2000000000'), // 2k ALGO
          status: ProposalStatus.Active,
          quorumRequired: 15, // 15%
          executed: false,
          cancelled: false,
          txId: 'PROP2...',
        },
        {
          id: '3',
          proposer: 'ASDF...5432',
          title: 'Lower Minimum Stake Requirement',
          description:
            'Reduce the minimum stake requirement from 1 ALGO to 0.1 ALGO to make the protocol more accessible to smaller investors.',
          type: ProposalType.UpdateMinimumStake,
          votingStartTime: Date.now() - 345600000, // 4 days ago
          votingEndTime: Date.now() - 86400000, // 1 day ago (ended)
          forVotes: BigInt('25000000000'), // 25k ALGO
          againstVotes: BigInt('5000000000'), // 5k ALGO
          abstainVotes: BigInt('3000000000'), // 3k ALGO
          status: ProposalStatus.Succeeded,
          quorumRequired: 10,
          executed: false,
          cancelled: false,
          txId: 'PROP3...',
        },
      ]

      setProposals(mockProposals)

      // Mock governance stats
      const mockStats: GovernanceStats = {
        totalVotingPower: BigInt('100000000000'), // 100k ALGO total
        activeProposals: mockProposals.filter((p) => p.status === ProposalStatus.Active).length,
        totalProposals: mockProposals.length,
        totalVoters: 234,
        averageParticipation: 65.4,
        quorumThreshold: 10,
        proposalThreshold: BigInt('1000000000'), // 1k ALGO needed to propose
        votingDuration: 604800, // 7 days
        executionDelay: 172800, // 2 days
        gracePeriod: 1209600, // 14 days
      }

      setGovernanceStats(mockStats)

      // Fetch user-specific data if wallet is connected
      if (activeAddress) {
        // Mock user voting power (based on staked amount)
        setUserVotingPower(BigInt('5000000000')) // 5k ALGO voting power

        // Mock user votes
        const mockUserVotes = {
          '1': {
            voter: activeAddress,
            proposalId: '1',
            option: VoteOption.For,
            votingPower: BigInt('5000000000'),
            timestamp: Date.now() - 43200000, // 12 hours ago
            txId: 'VOTE1...',
            reason: 'Higher rewards will attract more liquidity',
          },
        }

        setUserVotes(mockUserVotes)

        // Mock user profile
        const mockProfile: VoterProfile = {
          address: activeAddress,
          votingPower: BigInt('5000000000'),
          votingPowerPercentage: 5.0,
          totalVotes: 1,
          participationRate: 33.3, // Voted on 1 of 3 proposals
          averageVotingPower: BigInt('5000000000'),
          proposalsCreated: 0,
          lastVoted: Date.now() - 43200000,
          delegatedFrom: [],
        }

        setUserProfile(mockProfile)
      } else {
        setUserVotingPower(0n)
        setUserVotes({})
        setUserProfile(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch governance data'
      setError(errorMessage)
      enqueueSnackbar(errorMessage, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [activeAddress, algorand, enqueueSnackbar])

  // Load data on mount and when dependencies change
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Vote function
  const vote = useCallback(
    async (proposalId: string, option: VoteOption, reason?: string): Promise<string | null> => {
      if (!activeAddress || !transactionSigner) {
        enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
        return null
      }

      const validation = canVote(proposalId)
      if (!validation.canVote) {
        enqueueSnackbar(validation.reason || 'Cannot vote on this proposal', { variant: 'error' })
        return null
      }

      try {
        setVoting(true)
        setError(null)

        enqueueSnackbar('Submitting vote...', { variant: 'info' })

        // TODO: Replace with actual GovernanceVault contract call
        const result = await algorand.send.payment({
          sender: activeAddress,
          receiver: activeAddress, // Mock

          //amount: 1000, // Mock fee
          signer: transactionSigner,
          amount: new AlgoAmount({ algos: 0 }),
        })

        const txId = result.txIds[0]

        // Update local state optimistically
        const newVote: Vote = {
          voter: activeAddress,
          proposalId,
          option,
          votingPower: userVotingPower,
          timestamp: Date.now(),
          txId,
          reason,
        }

        setUserVotes((prev) => ({ ...prev, [proposalId]: newVote }))

        // Update proposal vote counts
        setProposals((prev) =>
          prev.map((proposal) => {
            if (proposal.id === proposalId) {
              const updated = { ...proposal }
              if (option === VoteOption.For) {
                updated.forVotes += userVotingPower
              } else if (option === VoteOption.Against) {
                updated.againstVotes += userVotingPower
              } else {
                updated.abstainVotes += userVotingPower
              }
              return updated
            }
            return proposal
          }),
        )

        enqueueSnackbar(`Vote submitted successfully! Transaction ID: ${txId.substring(0, 8)}...`, {
          variant: 'success',
        })

        return txId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Voting failed'
        setError(errorMessage)
        enqueueSnackbar(`Voting failed: ${errorMessage}`, { variant: 'error' })
        return null
      } finally {
        setVoting(false)
      }
    },
    [activeAddress, transactionSigner, userVotingPower, algorand, enqueueSnackbar],
  )

  // Create proposal function
  const createProposal = useCallback(
    async (proposalData: Omit<Proposal, 'id' | 'forVotes' | 'againstVotes' | 'abstainVotes' | 'status'>): Promise<string | null> => {
      if (!activeAddress || !transactionSigner || !governanceStats) {
        enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
        return null
      }

      if (userVotingPower < governanceStats.proposalThreshold) {
        enqueueSnackbar(`Insufficient voting power. Need ${Number(governanceStats.proposalThreshold) / 1e6} ALGO minimum.`, {
          variant: 'error',
        })
        return null
      }

      try {
        setCreating(true)
        setError(null)

        enqueueSnackbar('Creating proposal...', { variant: 'info' })

        // TODO: Replace with actual GovernanceVault contract call
        const result = await algorand.send.payment({
          sender: activeAddress,
          receiver: activeAddress, // Mock

          //amount: 2000, // Mock fee
          signer: transactionSigner,
          amount: new AlgoAmount({ algos: 0 }),
        })

        const txId = result.txIds[0]

        // Create new proposal with generated ID
        const newProposal: Proposal = {
          ...proposalData,
          id: (proposals.length + 1).toString(),
          proposer: activeAddress,
          forVotes: 0n,
          againstVotes: 0n,
          abstainVotes: 0n,
          status: ProposalStatus.Active,
          txId,
        }

        // Update local state
        setProposals((prev) => [newProposal, ...prev])

        enqueueSnackbar(`Proposal created successfully! Transaction ID: ${txId.substring(0, 8)}...`, {
          variant: 'success',
        })

        return txId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Proposal creation failed'
        setError(errorMessage)
        enqueueSnackbar(`Proposal creation failed: ${errorMessage}`, { variant: 'error' })
        return null
      } finally {
        setCreating(false)
      }
    },
    [activeAddress, transactionSigner, userVotingPower, governanceStats, proposals.length, algorand, enqueueSnackbar],
  )

  // Delegate function
  const delegate = useCallback(
    async (delegate: string): Promise<string | null> => {
      if (!activeAddress || !transactionSigner) {
        enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
        return null
      }

      try {
        enqueueSnackbar('Delegating voting power...', { variant: 'info' })

        // TODO: Replace with actual GovernanceVault contract call
        const result = await algorand.send.payment({
          sender: activeAddress,
          receiver: delegate,
          //amount: 1000, // Mock fee
          signer: transactionSigner,
          amount: new AlgoAmount({ algos: 0 }),
        })

        const txId = result.txIds[0]

        enqueueSnackbar(`Voting power delegated successfully! Transaction ID: ${txId.substring(0, 8)}...`, {
          variant: 'success',
        })

        // Refresh data to update delegation status
        await refreshData()

        return txId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Delegation failed'
        setError(errorMessage)
        enqueueSnackbar(`Delegation failed: ${errorMessage}`, { variant: 'error' })
        return null
      }
    },
    [activeAddress, transactionSigner, algorand, enqueueSnackbar, refreshData],
  )

  // Utility functions
  const getProposal = useCallback(
    (id: string): Proposal | null => {
      return proposals.find((p) => p.id === id) || null
    },
    [proposals],
  )

  const hasVoted = useCallback(
    (proposalId: string): boolean => {
      return proposalId in userVotes
    },
    [userVotes],
  )

  const canVote = useCallback(
    (proposalId: string): { canVote: boolean; reason?: string } => {
      const proposal = getProposal(proposalId)

      if (!proposal) {
        return { canVote: false, reason: 'Proposal not found' }
      }

      if (proposal.status !== ProposalStatus.Active) {
        return { canVote: false, reason: 'Proposal is not active' }
      }

      if (Date.now() > proposal.votingEndTime) {
        return { canVote: false, reason: 'Voting period has ended' }
      }

      if (hasVoted(proposalId)) {
        return { canVote: false, reason: 'You have already voted on this proposal' }
      }

      if (userVotingPower <= 0n) {
        return { canVote: false, reason: 'No voting power available' }
      }

      return { canVote: true }
    },
    [getProposal, hasVoted, userVotingPower],
  )

  const calculateQuorumProgress = useCallback(
    (proposalId: string): number => {
      const proposal = getProposal(proposalId)
      if (!proposal || !governanceStats) return 0

      const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes
      const requiredVotes = (governanceStats.totalVotingPower * BigInt(proposal.quorumRequired)) / 100n

      if (requiredVotes === 0n) return 0

      return Number((totalVotes * 100n) / requiredVotes)
    },
    [getProposal, governanceStats],
  )

  return {
    proposals,
    userVotes,
    userVotingPower,
    governanceStats,
    userProfile,
    loading,
    voting,
    creating,
    error,
    vote,
    createProposal,
    delegate,
    refreshData,
    getProposal,
    hasVoted,
    canVote,
    calculateQuorumProgress,
  }
}
