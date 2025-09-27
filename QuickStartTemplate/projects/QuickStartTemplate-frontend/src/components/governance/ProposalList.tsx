import React, { useState } from 'react'
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineClockCircle,
  AiOutlineExclamationCircle,
  AiOutlineFilter,
  AiOutlineSearch,
  AiOutlineUser,
  AiOutlineCalendar,
} from 'react-icons/ai'
import { BsCoin, BsGraphUp, BsShield } from 'react-icons/bs'
import { Proposal, ProposalStatus, ProposalType, VoteOption } from '../../types/governance'
import { useGovernance } from '../../hooks/useGovernance'
import { formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface ProposalListProps {
  onProposalClick?: (proposal: Proposal) => void
  onVoteClick?: (proposalId: string, option: VoteOption) => void
  showCreateButton?: boolean
  onCreateClick?: () => void
}

interface ProposalCardProps {
  proposal: Proposal
  userVotingPower: bigint
  hasVoted: boolean
  userVote?: VoteOption
  quorumProgress: number
  canVote: boolean
  onVoteClick: (option: VoteOption) => void
  onProposalClick: () => void
}

function ProposalCard({
  proposal,
  userVotingPower,
  hasVoted,
  userVote,
  quorumProgress,
  canVote,
  onVoteClick,
  onProposalClick,
}: ProposalCardProps) {
  const [showVoteButtons, setShowVoteButtons] = useState(false)

  const getStatusIcon = () => {
    switch (proposal.status) {
      case ProposalStatus.Active:
        return <AiOutlineClockCircle className="text-blue-400" />
      case ProposalStatus.Succeeded:
        return <AiOutlineCheckCircle className="text-green-400" />
      case ProposalStatus.Failed:
        return <AiOutlineCloseCircle className="text-red-400" />
      case ProposalStatus.Executed:
        return <AiOutlineCheckCircle className="text-purple-400" />
      case ProposalStatus.Cancelled:
        return <AiOutlineExclamationCircle className="text-yellow-400" />
      default:
        return <AiOutlineClockCircle className="text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (proposal.status) {
      case ProposalStatus.Active:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case ProposalStatus.Succeeded:
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case ProposalStatus.Failed:
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case ProposalStatus.Executed:
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      case ProposalStatus.Cancelled:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getTypeIcon = () => {
    switch (proposal.type) {
      case ProposalType.UpdateRewardRate:
        return <BsGraphUp />
      case ProposalType.EmergencyAction:
        return <BsShield />
      default:
        return <BsCoin />
    }
  }

  const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes
  const forPercentage = totalVotes > 0n ? Number((proposal.forVotes * 100n) / totalVotes) : 0
  const againstPercentage = totalVotes > 0n ? Number((proposal.againstVotes * 100n) / totalVotes) : 0

  const timeRemaining = proposal.votingEndTime - Date.now()
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)))
  const hoursRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-neutral-600 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center text-cyan-400">{getTypeIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-lg font-semibold text-gray-100 cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={onProposalClick}
              >
                {proposal.title}
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  {proposal.status}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 mb-2">{proposal.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <AiOutlineUser />
                {proposal.proposer.substring(0, 8)}...
              </div>
              <div className="flex items-center gap-1">
                <AiOutlineCalendar />
                {new Date(proposal.votingStartTime).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Progress */}
      {proposal.status === ProposalStatus.Active && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Voting Progress</span>
            <span className="text-gray-300">
              {daysRemaining}d {hoursRemaining}h remaining
            </span>
          </div>

          {/* Vote Distribution */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-green-500/20 rounded p-2 text-center">
              <div className="text-xs text-green-300">For</div>
              <div className="text-sm font-semibold text-green-400">{forPercentage.toFixed(1)}%</div>
              <div className="text-xs text-green-300/70">{formatLargeNumber(Number(proposal.forVotes) / 1e6)} ALGO</div>
            </div>
            <div className="bg-red-500/20 rounded p-2 text-center">
              <div className="text-xs text-red-300">Against</div>
              <div className="text-sm font-semibold text-red-400">{againstPercentage.toFixed(1)}%</div>
              <div className="text-xs text-red-300/70">{formatLargeNumber(Number(proposal.againstVotes) / 1e6)} ALGO</div>
            </div>
            <div className="bg-gray-500/20 rounded p-2 text-center">
              <div className="text-xs text-gray-300">Abstain</div>
              <div className="text-sm font-semibold text-gray-400">{(100 - forPercentage - againstPercentage).toFixed(1)}%</div>
              <div className="text-xs text-gray-300/70">{formatLargeNumber(Number(proposal.abstainVotes) / 1e6)} ALGO</div>
            </div>
          </div>

          {/* Quorum Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Quorum Progress</span>
              <span>
                {quorumProgress.toFixed(1)}% / {proposal.quorumRequired}%
              </span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  quorumProgress >= proposal.quorumRequired ? 'bg-green-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, quorumProgress)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Voting Actions */}
      {proposal.status === ProposalStatus.Active && (
        <div className="border-t border-neutral-700 pt-4">
          {hasVoted ? (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <AiOutlineCheckCircle />
              You voted {userVote === VoteOption.For ? 'For' : userVote === VoteOption.Against ? 'Against' : 'Abstain'}
            </div>
          ) : canVote ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowVoteButtons(!showVoteButtons)}
                className="w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300"
              >
                Vote ({formatLargeNumber(Number(userVotingPower) / 1e6)} ALGO)
              </button>

              {showVoteButtons && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onVoteClick(VoteOption.For)
                      setShowVoteButtons(false)
                    }}
                    className="py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                  >
                    For
                  </button>
                  <button
                    onClick={() => {
                      onVoteClick(VoteOption.Against)
                      setShowVoteButtons(false)
                    }}
                    className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                  >
                    Against
                  </button>
                  <button
                    onClick={() => {
                      onVoteClick(VoteOption.Abstain)
                      setShowVoteButtons(false)
                    }}
                    className="py-2 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  >
                    Abstain
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-400">{userVotingPower <= 0n ? 'No voting power' : 'Cannot vote'}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProposalList({ onProposalClick, onVoteClick, showCreateButton = true, onCreateClick }: ProposalListProps) {
  const { proposals, userVotingPower, governanceStats, hasVoted, userVotes, canVote, calculateQuorumProgress, vote, voting } =
    useGovernance()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ProposalType | 'all'>('all')

  // Filter proposals
  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    const matchesType = typeFilter === 'all' || proposal.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleVote = async (proposalId: string, option: VoteOption) => {
    const txId = await vote(proposalId, option)
    if (txId && onVoteClick) {
      onVoteClick(proposalId, option)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Governance Proposals</h2>
          <p className="text-gray-400 mt-1">Participate in protocol governance by voting on proposals</p>
        </div>

        {showCreateButton && governanceStats && userVotingPower >= governanceStats.proposalThreshold && (
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300 transform active:scale-95"
          >
            Create Proposal
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <AiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value={ProposalStatus.Active}>Active</option>
              <option value={ProposalStatus.Succeeded}>Succeeded</option>
              <option value={ProposalStatus.Failed}>Failed</option>
              <option value={ProposalStatus.Executed}>Executed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <BsCoin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ProposalType | 'all')}
              className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value={ProposalType.UpdateRewardRate}>Reward Rate</option>
              <option value={ProposalType.UpdateMinimumStake}>Min Stake</option>
              <option value={ProposalType.EmergencyAction}>Emergency</option>
              <option value={ProposalType.UpdateFees}>Fees</option>
            </select>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-400">
            <div>Total: {proposals.length}</div>
            <div>Filtered: {filteredProposals.length}</div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 text-center">
            <AiOutlineExclamationCircle className="text-4xl text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Proposals Found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more proposals.'
                : 'No governance proposals have been created yet.'}
            </p>
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              userVotingPower={userVotingPower}
              hasVoted={hasVoted(proposal.id)}
              userVote={userVotes[proposal.id]?.option}
              quorumProgress={calculateQuorumProgress(proposal.id)}
              canVote={canVote(proposal.id).canVote}
              onVoteClick={(option) => handleVote(proposal.id, option)}
              onProposalClick={() => onProposalClick?.(proposal)}
            />
          ))
        )}
      </div>

      {/* Voting Power Info */}
      {userVotingPower > 0n && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <BsCoin className="text-xl text-cyan-400" />
            <div>
              <div className="text-sm font-medium text-cyan-300">Your Voting Power</div>
              <div className="text-lg font-bold text-cyan-400">{formatLargeNumber(Number(userVotingPower) / 1e6)} ALGO</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
