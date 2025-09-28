import { getAIService } from './aiService'

export interface AIActionContext {
  userAddress?: string
  walletConnected: boolean
  currentPoolData?: any
  userStakeData?: any
  userBalance?: number
  availablePools?: any[]
}

export interface AIActionResult {
  success: boolean
  action?: string
  parameters?: any
  message: string
  requiresConfirmation?: boolean
  executeFunction?: () => Promise<any>
}

export interface ExecutableAction {
  type: 'staking' | 'governance' | 'payment' | 'token' | 'nft' | 'contract'
  action: string
  parameters: any
  confirmationMessage: string
  executeFunction: () => Promise<any>
}

class AIActionExecutor {
  private context: AIActionContext = { walletConnected: false }

  updateContext(newContext: Partial<AIActionContext>) {
    this.context = { ...this.context, ...newContext }
  }

  async parseAndExecuteCommand(userInput: string): Promise<AIActionResult> {
    try {
      const aiService = getAIService()
      if (!aiService) {
        return {
          success: false,
          message: "AI service not available. Please check your configuration."
        }
      }

      // First, parse the user intent using AI
      const intent = await this.parseUserIntent(userInput)

      if (!intent.success) {
        return intent
      }

      // Execute the action based on parsed intent
      return await this.executeAction(intent, userInput)
    } catch (error) {
      return {
        success: false,
        message: `Error processing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async parseUserIntent(userInput: string): Promise<AIActionResult> {
    const aiService = getAIService()

    const systemPrompt = `You are an AI assistant for AlgoVault, a DeFi platform on Algorand. Parse user commands and extract actionable intents.

Available actions:
1. CONVERSATIONAL: greetings, help, general questions
2. STAKING: stake, unstake, claim rewards, check staking status
3. GOVERNANCE: vote on proposals, create proposals, check voting power
4. PAYMENTS: send ALGO, receive payments, check balance
5. TOKENS: create ASA tokens, transfer tokens, check token balance
6. NFTS: mint NFTs, transfer NFTs, check NFT ownership
7. CONTRACTS: interact with smart contracts, deploy contracts

User context:
- Wallet connected: ${this.context.walletConnected}
- User address: ${this.context.userAddress || 'Not connected'}
- Current balance: ${this.context.userBalance || 'Unknown'} ALGO
- Has stake: ${this.context.userStakeData ? 'Yes' : 'No'}

Parse the user input and respond in this exact JSON format:
{
  "intent": "conversational|staking|governance|payment|token|nft|contract|info|help",
  "action": "specific action like 'stake', 'unstake', 'vote', 'send', etc.",
  "parameters": {
    "amount": "number if applicable",
    "recipient": "address if applicable",
    "poolId": "pool identifier if applicable",
    "proposalId": "proposal ID if applicable",
    "assetId": "asset ID if applicable",
    "any_other_params": "extracted values"
  },
  "confidence": 0.0-1.0,
  "requiresWallet": true/false,
  "requiresConfirmation": true/false,
  "message": "Human-readable explanation of what will be done"
}`

    const userPrompt = `User command: "${userInput}"`

    try {
      const response = await aiService.makeAIRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])

      if (!response.success || !response.data) {
        return {
          success: false,
          message: "Could not understand your request. Please try rephrasing."
        }
      }

      // response.data is already parsed JSON from aiService
      const parsedIntent = response.data

      // Validate required fields
      if (!parsedIntent.intent || !parsedIntent.action) {
        return {
          success: false,
          message: "Could not determine what action you want to perform."
        }
      }

      // Check if wallet is required but not connected
      if (parsedIntent.requiresWallet && !this.context.walletConnected) {
        return {
          success: false,
          message: "Please connect your wallet first to perform this action."
        }
      }

      return {
        success: true,
        action: parsedIntent.action,
        parameters: parsedIntent.parameters || {},
        message: parsedIntent.message,
        requiresConfirmation: parsedIntent.requiresConfirmation
      }
    } catch (error) {
      return {
        success: false,
        message: "Error understanding your request. Please try again."
      }
    }
  }

  private async executeAction(intent: AIActionResult, userInput: string): Promise<AIActionResult> {
    if (!intent.action || !intent.parameters) {
      return {
        success: false,
        message: "Invalid action parameters"
      }
    }

    // Route to specific action handlers based on intent type
    switch (intent.action.toLowerCase()) {
      // CONVERSATIONAL ACTIONS
      case 'greeting':
      case 'greet':
      case 'hello':
      case 'hi':
      case 'hey':
        return await this.createGreetingResponse()
      case 'help':
      case 'info':
        return await this.createHelpResponse()
      case 'general question':
      case 'question':
      case 'conversational':
      case 'general':
        return await this.createGeneralResponse(userInput)

      // STAKING ACTIONS
      case 'stake':
        return this.createStakeAction(intent.parameters)
      case 'unstake':
        return this.createUnstakeAction(intent.parameters)
      case 'claim':
      case 'claim rewards':
        return this.createClaimAction(intent.parameters)
      case 'check stake':
      case 'staking status':
        return this.createCheckStakeAction()

      // GOVERNANCE ACTIONS
      case 'vote':
        return this.createVoteAction(intent.parameters)
      case 'create proposal':
        return this.createProposalAction(intent.parameters)
      case 'check voting power':
        return this.createCheckVotingPowerAction()

      // PAYMENT ACTIONS
      case 'send':
      case 'send algo':
      case 'pay':
        return this.createPaymentAction(intent.parameters)
      case 'check balance':
        return this.createBalanceCheckAction()

      // TOKEN ACTIONS
      case 'create token':
      case 'mint token':
        return this.createTokenAction(intent.parameters)
      case 'transfer token':
        return this.createTokenTransferAction(intent.parameters)

      // NFT ACTIONS
      case 'mint nft':
      case 'create nft':
        return this.createNFTAction(intent.parameters)
      case 'transfer nft':
        return this.createNFTTransferAction(intent.parameters)

      default:
        return {
          success: false,
          message: `Action "${intent.action}" is not supported yet. Available actions: stake, unstake, claim, vote, send, create token, mint nft.`
        }
    }
  }

  // STAKING ACTION CREATORS
  private createStakeAction(params: any): AIActionResult {
    const amount = params.amount || params.value
    if (!amount || isNaN(Number(amount))) {
      return {
        success: false,
        message: "Please specify a valid amount to stake (e.g., 'stake 100 ALGO')"
      }
    }

    return {
      success: true,
      action: 'stake',
      parameters: { amount: Number(amount), poolId: params.poolId || 'pool-1' },
      message: `Ready to stake ${amount} ALGO. This will lock your tokens to earn rewards.`,
      requiresConfirmation: true,
      executeFunction: async () => {
        // This will be connected to actual staking function
        return { type: 'staking', action: 'stake', amount: Number(amount) }
      }
    }
  }

  private createUnstakeAction(params: any): AIActionResult {
    const amount = params.amount || params.value || 'all'

    return {
      success: true,
      action: 'unstake',
      parameters: { amount: amount === 'all' ? 'all' : Number(amount) },
      message: `Ready to unstake ${amount === 'all' ? 'all staked tokens' : amount + ' ALGO'}. You will stop earning rewards.`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'staking', action: 'unstake', amount }
      }
    }
  }

  private createClaimAction(params: any): AIActionResult {
    return {
      success: true,
      action: 'claim',
      parameters: {},
      message: "Ready to claim your earned rewards. This will add them to your wallet balance.",
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'staking', action: 'claim' }
      }
    }
  }

  private createCheckStakeAction(): AIActionResult {
    if (!this.context.userStakeData) {
      return {
        success: true,
        message: "You don't have any active stakes. Would you like to start staking to earn rewards?"
      }
    }

    return {
      success: true,
      message: `Your staking status: ${JSON.stringify(this.context.userStakeData, null, 2)}`
    }
  }

  // GOVERNANCE ACTION CREATORS
  private createVoteAction(params: any): AIActionResult {
    const proposalId = params.proposalId || params.proposal
    const vote = params.vote || params.choice

    if (!proposalId) {
      return {
        success: false,
        message: "Please specify which proposal to vote on (e.g., 'vote yes on proposal 1')"
      }
    }

    return {
      success: true,
      action: 'vote',
      parameters: { proposalId, vote: vote || 'for' },
      message: `Ready to vote "${vote || 'for'}" on proposal ${proposalId}.`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'governance', action: 'vote', proposalId, vote }
      }
    }
  }

  private createProposalAction(params: any): AIActionResult {
    return {
      success: true,
      action: 'create_proposal',
      parameters: params,
      message: "Ready to create a new governance proposal. This requires detailed information.",
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'governance', action: 'create_proposal', params }
      }
    }
  }

  private createCheckVotingPowerAction(): AIActionResult {
    return {
      success: true,
      message: `Your voting power: ${this.context.userStakeData ? 'Based on your staked amount' : '0 (no stakes)'}`
    }
  }

  // PAYMENT ACTION CREATORS
  private createPaymentAction(params: any): AIActionResult {
    const amount = params.amount || params.value
    const recipient = params.recipient || params.to || params.address

    if (!amount || !recipient) {
      return {
        success: false,
        message: "Please specify amount and recipient (e.g., 'send 10 ALGO to [address]')"
      }
    }

    return {
      success: true,
      action: 'send_payment',
      parameters: { amount: Number(amount), recipient },
      message: `Ready to send ${amount} ALGO to ${recipient.substring(0, 8)}...`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'payment', action: 'send', amount: Number(amount), recipient }
      }
    }
  }

  private createBalanceCheckAction(): AIActionResult {
    return {
      success: true,
      message: `Your balance: ${this.context.userBalance || 'Unknown'} ALGO`
    }
  }

  // TOKEN ACTION CREATORS
  private createTokenAction(params: any): AIActionResult {
    const name = params.name || params.tokenName
    const symbol = params.symbol || params.ticker
    const supply = params.supply || params.amount || 1000000

    return {
      success: true,
      action: 'create_token',
      parameters: { name, symbol, supply: Number(supply) },
      message: `Ready to create token "${name}" (${symbol}) with supply of ${supply}.`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'token', action: 'create', name, symbol, supply: Number(supply) }
      }
    }
  }

  private createTokenTransferAction(params: any): AIActionResult {
    const amount = params.amount
    const recipient = params.recipient || params.to
    const assetId = params.assetId || params.tokenId

    return {
      success: true,
      action: 'transfer_token',
      parameters: { amount: Number(amount), recipient, assetId },
      message: `Ready to transfer ${amount} tokens (Asset ID: ${assetId}) to ${recipient?.substring(0, 8)}...`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'token', action: 'transfer', amount: Number(amount), recipient, assetId }
      }
    }
  }

  // NFT ACTION CREATORS
  private createNFTAction(params: any): AIActionResult {
    const name = params.name || params.nftName
    const description = params.description || 'AI-created NFT'

    return {
      success: true,
      action: 'mint_nft',
      parameters: { name, description },
      message: `Ready to mint NFT "${name}".`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'nft', action: 'mint', name, description }
      }
    }
  }

  private createNFTTransferAction(params: any): AIActionResult {
    const recipient = params.recipient || params.to
    const assetId = params.assetId || params.nftId

    return {
      success: true,
      action: 'transfer_nft',
      parameters: { recipient, assetId },
      message: `Ready to transfer NFT (Asset ID: ${assetId}) to ${recipient?.substring(0, 8)}...`,
      requiresConfirmation: true,
      executeFunction: async () => {
        return { type: 'nft', action: 'transfer', recipient, assetId }
      }
    }
  }

  // CONVERSATIONAL ACTION CREATORS
  private async createGreetingResponse(): Promise<AIActionResult> {
    try {
      const aiService = getAIService()
      const response = await aiService.getChatResponse(
        "User said hello/hey/hi. Respond naturally and ask how you can help.",
        {
          userStakes: this.context.userStakeData ? [this.context.userStakeData] : [],
          portfolioValue: this.context.userBalance,
          recentActivity: []
        }
      )

      if (response.success && response.data) {
        return {
          success: true,
          message: response.data.response
        }
      } else {
        // Fallback response if AI fails
        return {
          success: true,
          message: "Hello! I'm your AI assistant for AlgoVault. I can help you with staking, governance, payments, tokens, NFTs, and more! Try saying something like 'stake 100 ALGO' or 'help'."
        }
      }
    } catch (error) {
      return {
        success: true,
        message: "Hello! I'm your AI assistant for AlgoVault. I can help you with staking, governance, payments, tokens, NFTs, and more! Try saying something like 'stake 100 ALGO' or 'help'."
      }
    }
  }

  private async createGeneralResponse(userQuestion: string): Promise<AIActionResult> {
    try {
      const aiService = getAIService()
      const response = await aiService.getChatResponse(
        userQuestion,
        {
          userStakes: this.context.userStakeData ? [this.context.userStakeData] : [],
          portfolioValue: this.context.userBalance,
          recentActivity: []
        }
      )

      if (response.success && response.data) {
        return {
          success: true,
          message: response.data.response
        }
      } else {
        return {
          success: true,
          message: "I'm here to help with questions about DeFi, Algorand, or general topics. What would you like to know?"
        }
      }
    } catch (error) {
      return {
        success: true,
        message: "I'm here to help with questions about DeFi, Algorand, or general topics. What would you like to know?"
      }
    }
  }

  private async createHelpResponse(): Promise<AIActionResult> {
    try {
      const aiService = getAIService()
      const response = await aiService.getChatResponse(
        "User asked for help. Provide a comprehensive but concise overview of what I can do with AlgoVault, including examples.",
        {
          userStakes: this.context.userStakeData ? [this.context.userStakeData] : [],
          portfolioValue: this.context.userBalance,
          recentActivity: []
        }
      )

      if (response.success && response.data) {
        return {
          success: true,
          message: response.data.response
        }
      } else {
        // Fallback response if AI fails
        return {
          success: true,
          message: `I can help you with:

🏦 **Staking**: "stake 100 ALGO", "unstake all", "claim rewards"
🗳️ **Governance**: "vote yes on proposal 1", "check voting power"
💸 **Payments**: "send 5 ALGO to [address]", "check balance"
🪙 **Tokens**: "create token MyToken with symbol MT and supply 1000"
🖼️ **NFTs**: "mint NFT called MyArt with description 'Cool artwork'"

Just speak naturally and I'll understand what you want to do!`
        }
      }
    } catch (error) {
      return {
        success: true,
        message: `I can help you with:

🏦 **Staking**: "stake 100 ALGO", "unstake all", "claim rewards"
🗳️ **Governance**: "vote yes on proposal 1", "check voting power"
💸 **Payments**: "send 5 ALGO to [address]", "check balance"
🪙 **Tokens**: "create token MyToken with symbol MT and supply 1000"
🖼️ **NFTs**: "mint NFT called MyArt with description 'Cool artwork'"

Just speak naturally and I'll understand what you want to do!`
      }
    }
  }
}

// Singleton instance
let aiActionExecutorInstance: AIActionExecutor | null = null

export const getAIActionExecutor = (): AIActionExecutor => {
  if (!aiActionExecutorInstance) {
    aiActionExecutorInstance = new AIActionExecutor()
  }
  return aiActionExecutorInstance
}

export default AIActionExecutor