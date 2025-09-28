import OpenAI from 'openai'

interface AIConfig {
  groqApiKey?: string
  openRouterApiKey?: string
  preferredProvider: 'groq' | 'openrouter'
}

interface AIResponse {
  success: boolean
  data?: any
  error?: string
  confidence?: number
}

interface YieldPredictionRequest {
  poolData: {
    totalStaked: bigint
    currentAPY: number
    poolUtilization: number
    historicalYields: number[]
    marketConditions: string
  }
  timeframe: '1d' | '7d' | '30d' | '90d'
}

interface PortfolioOptimizationRequest {
  currentAllocations: {
    poolId: string
    amount: bigint
    apy: number
    risk: number
  }[]
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentAmount: number
  timeHorizon: number
}

interface RiskAssessmentRequest {
  poolData: {
    totalStaked: bigint
    volatility: number
    liquidityDepth: number
    contractAge: number
    auditStatus: string
  }
  marketData: {
    algoPrice: number
    marketVolatility: number
    defiTvl: number
  }
}

class AIService {
  private groqClient: OpenAI | null = null
  private openRouterClient: OpenAI | null = null
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
    this.initializeClients()
  }

  private initializeClients() {
    // Initialize Groq client
    if (this.config.groqApiKey) {
      this.groqClient = new OpenAI({
        apiKey: this.config.groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
        dangerouslyAllowBrowser: true,
      })
    }

    // Initialize OpenRouter client
    if (this.config.openRouterApiKey) {
      this.openRouterClient = new OpenAI({
        apiKey: this.config.openRouterApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        dangerouslyAllowBrowser: true,
        defaultHeaders: {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AlgoVault DeFi Platform',
        },
      })
    }
  }

  private async makeAIRequest(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    model?: string,
  ): Promise<AIResponse> {
    try {
      const client = this.config.preferredProvider === 'groq' ? this.groqClient : this.openRouterClient

      if (!client) {
        throw new Error(`${this.config.preferredProvider} client not initialized`)
      }

      const defaultModel = this.config.preferredProvider === 'groq' ? 'llama-3.1-8b-instant' : 'meta-llama/llama-3.1-70b-instruct'

      const response = await client.chat.completions.create({
        model: model || defaultModel,
        messages,
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content received')
      }

      return {
        success: true,
        data: JSON.parse(content),
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error',
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const client = this.config.preferredProvider === 'groq' ? this.groqClient : this.openRouterClient
      return client !== null
    } catch {
      return false
    }
  }

  async predictYields(request: YieldPredictionRequest): Promise<AIResponse> {
    const systemPrompt = `You are an expert DeFi yield analyst. Analyze the provided pool data and predict future yields.
    
    Consider these factors:
    - Current pool utilization and staking levels
    - Historical yield patterns
    - Market conditions and volatility
    - Algorand ecosystem trends
    - DeFi sector performance
    
    Provide predictions with confidence intervals and reasoning.
    
    Respond in JSON format:
    {
      "predictions": {
        "conservative": number,
        "expected": number,
        "optimistic": number
      },
      "confidence": number,
      "factors": string[],
      "reasoning": string,
      "recommendations": string[]
    }`

    const userPrompt = `Analyze this AlgoVault pool data for ${request.timeframe} yield prediction:
    
    Pool Metrics:
    - Total Staked: ${Number(request.poolData.totalStaked) / 1e6} ALGO
    - Current APY: ${request.poolData.currentAPY}%
    - Pool Utilization: ${request.poolData.poolUtilization}%
    - Historical Yields: ${request.poolData.historicalYields.join(', ')}%
    - Market Conditions: ${request.poolData.marketConditions}
    
    Timeframe: ${request.timeframe}
    
    Provide yield predictions with detailed analysis.`

    return this.makeAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])
  }

  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<AIResponse> {
    const systemPrompt = `You are an expert DeFi portfolio optimization specialist. Analyze current allocations and provide optimal portfolio recommendations.
    
    Consider:
    - Risk-adjusted returns (Sharpe ratio)
    - Diversification benefits
    - Correlation between pools
    - Risk tolerance alignment
    - Market conditions and trends
    - Impermanent loss potential
    - Liquidity considerations
    
    Respond in JSON format:
    {
      "recommendations": [
        {
          "poolId": string,
          "recommendedAllocation": number,
          "reasoning": string,
          "expectedReturn": number,
          "riskLevel": number
        }
      ],
      "portfolioMetrics": {
        "expectedApy": number,
        "riskScore": number,
        "sharpeRatio": number,
        "diversificationScore": number
      },
      "warnings": string[],
      "opportunities": string[]
    }`

    const allocationsText = request.currentAllocations
      .map((alloc) => `Pool ${alloc.poolId}: ${Number(alloc.amount) / 1e6} ALGO (${alloc.apy}% APY, Risk: ${alloc.risk}/10)`)
      .join('\n')

    const userPrompt = `Optimize this AlgoVault portfolio:
    
    Current Allocations:
    ${allocationsText}
    
    Parameters:
    - Risk Tolerance: ${request.riskTolerance}
    - Additional Investment: ${request.investmentAmount} ALGO
    - Time Horizon: ${request.timeHorizon} months
    
    Provide optimal allocation recommendations with detailed reasoning.`

    return this.makeAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])
  }

  async assessRisk(request: RiskAssessmentRequest): Promise<AIResponse> {
    const systemPrompt = `You are an expert DeFi risk analyst. Evaluate the risk profile of DeFi pools and provide comprehensive risk assessments.
    
    Analyze these risk factors:
    - Smart contract risk
    - Liquidity risk  
    - Market risk
    - Operational risk
    - Regulatory risk
    - Technical risk
    
    Respond in JSON format:
    {
      "overallRisk": {
        "score": number,
        "level": "low" | "medium" | "high" | "critical",
        "confidence": number
      },
      "riskFactors": [
        {
          "category": string,
          "score": number,
          "impact": string,
          "likelihood": string,
          "mitigation": string
        }
      ],
      "recommendations": string[],
      "warnings": string[],
      "monitoring": string[]
    }`

    const userPrompt = `Assess risk for this AlgoVault pool:
    
    Pool Data:
    - Total Staked: ${Number(request.poolData.totalStaked) / 1e6} ALGO
    - Volatility: ${request.poolData.volatility}%
    - Liquidity Depth: ${request.poolData.liquidityDepth}
    - Contract Age: ${request.poolData.contractAge} days
    - Audit Status: ${request.poolData.auditStatus}
    
    Market Context:
    - ALGO Price: $${request.marketData.algoPrice}
    - Market Volatility: ${request.marketData.marketVolatility}%
    - DeFi TVL: $${request.marketData.defiTvl}M
    
    Provide comprehensive risk analysis.`

    return this.makeAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])
  }

  async analyzeGovernanceProposal(
    proposalTitle: string,
    proposalDescription: string,
    proposalType: string,
    votingPower: bigint,
    historicalVotes: any[],
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert DeFi governance analyst. Analyze governance proposals and provide voting recommendations.
    
    Consider:
    - Proposal impact on protocol
    - Economic implications
    - Risk/benefit analysis
    - Alignment with user interests
    - Protocol long-term health
    - Precedent and governance history
    
    Respond in JSON format:
    {
      "recommendation": "for" | "against" | "abstain",
      "confidence": number,
      "reasoning": string,
      "analysis": {
        "benefits": string[],
        "risks": string[],
        "economicImpact": string,
        "technicalComplexity": number
      },
      "alternatives": string[],
      "considerations": string[]
    }`

    const userPrompt = `Analyze this AlgoVault governance proposal:
    
    Title: ${proposalTitle}
    Type: ${proposalType}
    Description: ${proposalDescription}
    
    My Voting Power: ${Number(votingPower) / 1e6} ALGO
    Historical Voting Pattern: ${historicalVotes.length} previous votes
    
    Should I vote for, against, or abstain? Provide detailed analysis.`

    return this.makeAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])
  }

  async getChatResponse(
    message: string,
    context: {
      userStakes?: any[]
      portfolioValue?: number
      recentActivity?: any[]
    },
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert DeFi assistant for AlgoVault, a sophisticated yield farming platform on Algorand. 
    
    Help users with:
    - Staking strategies and optimization
    - Yield farming best practices
    - Risk management advice
    - Governance participation
    - Market analysis and trends
    - Technical questions about DeFi
    
    Be helpful, accurate, and always consider user's risk tolerance. Provide actionable advice.
    
    Respond in JSON format:
    {
      "response": string,
      "suggestions": string[],
      "links": string[],
      "followUp": string[]
    }`

    const contextInfo = context.userStakes
      ? `User Context:
      - Active Stakes: ${context.userStakes.length} pools
      - Portfolio Value: ${context.portfolioValue} ALGO
      - Recent Activity: ${context.recentActivity?.length || 0} transactions`
      : 'New user exploring AlgoVault'

    const userPrompt = `${contextInfo}

User Question: ${message}

Provide helpful DeFi guidance for AlgoVault platform.`

    return this.makeAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null

export const initializeAIService = (config: AIConfig) => {
  aiServiceInstance = new AIService(config)
  return aiServiceInstance
}

export const getAIService = (): AIService => {
  if (!aiServiceInstance) {
    throw new Error('AI Service not initialized. Call initializeAIService first.')
  }
  return aiServiceInstance
}

export default AIService
export type { AIConfig, AIResponse, YieldPredictionRequest, PortfolioOptimizationRequest, RiskAssessmentRequest }
