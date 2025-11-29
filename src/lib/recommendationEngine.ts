import { Market, LogisticsRoute, ResearchReport, LogisticsProvider, mockMarkets, mockLogisticsRoutes, mockResearchReports } from '@/data/mockData';
import { MarketRecommendation, LogisticsRecommendation, ResearchRecommendation, UserPreferences } from '@/types';
import { CollaborativeFilteringEngine, mockUserInteractions, mockUserPreferences } from './collaborativeFiltering';
import { ContextualBandits, BanditContext, createContextualBandits } from './contextualBandits';
import { MarketPredictor, MarketPrediction, createMarketPredictor } from './marketPredictor';
import { RiskAssessor, RiskAssessment, createRiskAssessor } from './riskAssessment';
import { UserPersonalizationEngine, PersonalizationContext, createUserPersonalizationEngine } from './userPersonalization';

// Simple rule-based recommendation engine
export class RecommendationEngine {
  private markets: Market[];
  private routes: LogisticsRoute[];
  private reports: ResearchReport[];
  private collaborativeEngine: CollaborativeFilteringEngine;
  private banditsEngine: ContextualBandits;
  private marketPredictor: MarketPredictor;
  private riskAssessor: RiskAssessor;
  private personalizationEngine: UserPersonalizationEngine;

  constructor(markets: Market[], routes: LogisticsRoute[], reports: ResearchReport[]) {
    this.markets = markets;
    this.routes = routes;
    this.reports = reports;
    this.collaborativeEngine = new CollaborativeFilteringEngine(mockUserInteractions, mockUserPreferences);
    this.banditsEngine = createContextualBandits();
    this.marketPredictor = createMarketPredictor();
    this.riskAssessor = createRiskAssessor();
    this.personalizationEngine = createUserPersonalizationEngine();
  }

  // Recommend markets based on criteria using ML predictions
  recommendMarkets(criteria: {
    minDemandScore?: number;
    products?: string[];
    maxCompetition?: 'Low' | 'Medium' | 'High';
    location?: { lat: number; lng: number; radius: number };
  }): MarketRecommendation[] {
    const filteredMarkets = this.markets.filter(market => {
      if (criteria.minDemandScore && market.demandScore < criteria.minDemandScore) return false;
      if (criteria.products && !criteria.products.some(p => market.products.includes(p))) return false;
      if (criteria.maxCompetition) {
        const compLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
        if (compLevels[market.competition] > compLevels[criteria.maxCompetition]) return false;
      }
      if (criteria.location) {
        const distance = this.calculateDistance(
          market.location.lat, market.location.lng,
          criteria.location.lat, criteria.location.lng
        );
        if (distance > criteria.location.radius) return false;
      }
      return true;
    });

    return filteredMarkets.map(market => {
      // Use ML prediction as primary score
      const prediction = this.marketPredictor.predict(market);
      const score = prediction.predictedSuccess * 100; // Convert to 0-100 scale

      const relatedReports = this.recommendResearchReports({ tags: market.products, category: 'Market Trends' });
      const suggestedRoutes = this.routes.filter(route =>
        route.origin.toLowerCase().includes(market.location.address.toLowerCase().split(',')[1]?.trim() || '') ||
        route.destination.toLowerCase().includes(market.location.address.toLowerCase().split(',')[1]?.trim() || '')
      );

      return {
        market,
        score,
        reason: `ML prediction: ${(prediction.predictedSuccess * 100).toFixed(1)}% success probability`,
        relatedReports: relatedReports.slice(0, 2).map(r => r.report),
        suggestedRoutes: suggestedRoutes.slice(0, 1)
      };
    }).sort((a, b) => b.score - a.score);
  }

  // Recommend logistics routes and providers using contextual bandits
  recommendLogistics(origin: string, destination: string, context?: BanditContext): LogisticsRecommendation[] {
    const relevantRoutes = this.routes.filter(route =>
      route.origin.toLowerCase().includes(origin.toLowerCase()) &&
      route.destination.toLowerCase().includes(destination.toLowerCase())
    );

    return relevantRoutes.map(route => {
      // Use contextual bandits if context is provided, otherwise fallback to rule-based
      const defaultContext: BanditContext = {
        origin,
        destination,
        distance: route.distance,
        urgency: 'medium',
        cargoType: 'general'
      };

      const banditContext = context || defaultContext;
      const providerRecommendations = this.banditsEngine.getProviderRecommendations(route, banditContext, 1);

      const bestProvider = providerRecommendations[0]?.provider || route.providers[0];
      const score = providerRecommendations[0]?.score || (bestProvider.rating + bestProvider.reliability) / 2;

      return {
        route,
        bestProvider,
        score,
        reason: `AI-selected provider: ${bestProvider.name} (learning from past performance)`
      };
    }).sort((a, b) => b.score - a.score);
  }

  // Recommend research reports
  recommendResearchReports(criteria: {
    tags?: string[];
    category?: string;
    keywords?: string[];
  }): ResearchRecommendation[] {
    const filteredReports = this.reports.filter(report => {
      if (criteria.category && report.category !== criteria.category) return false;
      if (criteria.tags && !criteria.tags.some(tag => report.tags.includes(tag))) return false;
      if (criteria.keywords && !criteria.keywords.some(keyword =>
        report.title.toLowerCase().includes(keyword.toLowerCase()) ||
        report.summary.toLowerCase().includes(keyword.toLowerCase())
      )) return false;
      return true;
    });

    return filteredReports.map(report => {
      let relevanceScore = 0;
      let matchingTags: string[] = [];

      if (criteria.tags) {
        matchingTags = report.tags.filter(tag => criteria.tags!.includes(tag));
        relevanceScore += matchingTags.length * 20;
      }

      if (criteria.keywords) {
        const keywordMatches = criteria.keywords.filter(keyword =>
          report.title.toLowerCase().includes(keyword.toLowerCase()) ||
          report.summary.toLowerCase().includes(keyword.toLowerCase())
        );
        relevanceScore += keywordMatches.length * 15;
      }

      // Recency bonus (newer reports get higher score)
      const daysSincePublished = (Date.now() - new Date(report.date).getTime()) / (1000 * 60 * 60 * 24);
      relevanceScore += Math.max(0, 30 - daysSincePublished);

      return {
        report,
        relevanceScore,
        matchingTags
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private calculateMarketScore(market: Market): number {
    // Simple scoring: demandScore + growthRate - competition penalty
    const compPenalty = { 'Low': 0, 'Medium': 10, 'High': 20 };
    return market.demandScore + market.growthRate - compPenalty[market.competition];
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula for distance in km
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get collaborative filtering recommendations
  getCollaborativeRecommendations(userId: string): {
    marketRecommendations: MarketRecommendation[];
    logisticsRecommendations: LogisticsRecommendation[];
    researchRecommendations: ResearchRecommendation[];
  } {
    return this.collaborativeEngine.generatePersonalizedRecommendations(
      userId,
      this.markets,
      this.routes,
      this.reports
    );
  }

  // Record user interaction for collaborative filtering and personalization
  recordUserInteraction(
    userId: string,
    itemType: 'market' | 'logistics' | 'research',
    itemId: string,
    interactionType: 'view' | 'save' | 'contact' | 'analyze',
    rating?: number
  ): void {
    const interaction = {
      id: `${userId}-${itemType}-${itemId}-${Date.now()}`,
      userId,
      itemType,
      itemId,
      interactionType,
      timestamp: new Date(),
      rating
    };
    this.collaborativeEngine.addInteraction(interaction);
    this.personalizationEngine.recordInteraction(userId, interaction);
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(
    userId: string,
    context: PersonalizationContext
  ): {
    marketRecommendations: MarketRecommendation[];
    logisticsRecommendations: LogisticsRecommendation[];
    researchRecommendations: ResearchRecommendation[];
    personalizationReasoning: string[];
  } {
    // Get base recommendations
    const baseRecs = this.getRiskAdjustedRecommendations(userId, 'medium');

    // Apply personalization
    const personalized = this.personalizationEngine.getPersonalizedRecommendations(
      userId,
      context,
      {
        markets: baseRecs.marketRecommendations.map(r => r.market),
        routes: baseRecs.logisticsRecommendations.map(r => r.route),
        reports: baseRecs.researchRecommendations.map(r => r.report)
      }
    );

    // Convert back to recommendation format with updated scores
    const marketRecommendations: MarketRecommendation[] = personalized.markets
      .slice(0, 4)
      .map(market => {
        const prediction = this.marketPredictor.predict(market);
        return {
          market,
          score: prediction.predictedSuccess * 100,
          reason: `Personalized recommendation based on your preferences`,
          relatedReports: this.recommendResearchReports({ tags: market.products }).slice(0, 2).map(r => r.report),
          suggestedRoutes: this.routes.filter(route =>
            route.origin.toLowerCase().includes(market.location.address.toLowerCase().split(',')[1]?.trim() || '')
          ).slice(0, 1)
        };
      });

    const logisticsRecommendations: LogisticsRecommendation[] = personalized.routes
      .slice(0, 2)
      .map(route => {
        const context: BanditContext = {
          origin: route.origin,
          destination: route.destination,
          distance: route.distance,
          urgency: 'medium',
          cargoType: 'general'
        };
        const providerRecs = this.banditsEngine.getProviderRecommendations(route, context, 1);
        const bestProvider = providerRecs[0]?.provider || route.providers[0];

        return {
          route,
          bestProvider,
          score: providerRecs[0]?.score || 50,
          reason: `Personalized logistics selection`
        };
      });

    const researchRecommendations: ResearchRecommendation[] = personalized.reports
      .slice(0, 3)
      .map(report => ({
        report,
        relevanceScore: 80 + Math.random() * 20, // Mock score
        matchingTags: report.tags.slice(0, 2)
      }));

    return {
      marketRecommendations,
      logisticsRecommendations,
      researchRecommendations,
      personalizationReasoning: personalized.reasoning
    };
  }

  // Update user preferences
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    console.log('Debug: Updating user preferences for', userId, 'with', preferences);
    this.personalizationEngine.updateUserPreferences(userId, preferences);
  }

  // Get user analytics
  getUserAnalytics(userId: string): {
    totalInteractions: number;
    avgSessionLength: number;
    topInterests: string[];
    conversionRate: number;
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
  } {
    console.log('Debug: Getting user analytics for', userId);
    return this.personalizationEngine.getUserAnalytics(userId);
  }

  // Provide feedback to contextual bandits for logistics provider performance
  provideLogisticsFeedback(
    route: LogisticsRoute,
    provider: LogisticsProvider,
    context: BanditContext,
    performance: 'success' | 'delay' | 'failure',
    actualCost?: number
  ): void {
    // Convert performance to reward score
    let reward = 0;
    switch (performance) {
      case 'success':
        reward = 1.0;
        break;
      case 'delay':
        reward = 0.5;
        break;
      case 'failure':
        reward = 0.0;
        break;
    }

    // Adjust reward based on cost efficiency
    if (actualCost) {
      const costEfficiency = Math.max(0, 1 - (actualCost - route.costRange.min) / (route.costRange.max - route.costRange.min));
      reward = reward * 0.8 + costEfficiency * 0.2;
    }

    this.banditsEngine.updateReward(route, provider, reward);
  }

  // Get ML predictions for markets
  getMarketPredictions(markets?: Market[]): MarketPrediction[] {
    const marketsToPredict = markets || this.markets;
    return this.marketPredictor.predictBatch(marketsToPredict);
  }

  // Update ML model with feedback
  updateMarketModel(market: Market, actualSuccess: number): void {
    this.marketPredictor.updateModel(market, actualSuccess);
  }

  // Get risk assessment for market
  getMarketRiskAssessment(market: Market): RiskAssessment {
    return this.riskAssessor.assessMarketRisk(market);
  }

  // Get risk assessment for logistics route and provider
  getLogisticsRiskAssessment(route: LogisticsRoute, provider: LogisticsProvider): RiskAssessment {
    return this.riskAssessor.assessLogisticsRisk(route, provider);
  }

  // Get risk-adjusted recommendations
  getRiskAdjustedRecommendations(userId: string, riskTolerance: 'low' | 'medium' | 'high' = 'medium'): {
    marketRecommendations: MarketRecommendation[];
    logisticsRecommendations: LogisticsRecommendation[];
    researchRecommendations: ResearchRecommendation[];
  } {
    const baseRecommendations = this.getCollaborativeRecommendations(userId);

    // Adjust recommendations based on risk tolerance
    const riskMultiplier = riskTolerance === 'high' ? 1.2 :
                          riskTolerance === 'low' ? 0.7 : 1.0;
    console.log('Debug: riskMultiplier calculated as', riskMultiplier);

    // Filter out high-risk recommendations based on tolerance
    const filteredMarkets = baseRecommendations.marketRecommendations.filter(rec => {
      const market = this.markets.find(m => m.id === rec.market.id);
      if (!market) return true;

      const risk = this.getMarketRiskAssessment(market);
      const riskThreshold = riskTolerance === 'low' ? 0.4 :
                           riskTolerance === 'medium' ? 0.7 : 1.0;

      return risk.overallRisk <= riskThreshold;
    });

    const filteredLogistics = baseRecommendations.logisticsRecommendations.filter(rec => {
      const route = this.routes.find(r => r.id === rec.route.id);
      if (!route) return true;

      const risk = this.getLogisticsRiskAssessment(route, rec.bestProvider);
      const riskThreshold = riskTolerance === 'low' ? 0.4 :
                           riskTolerance === 'medium' ? 0.7 : 1.0;

      return risk.overallRisk <= riskThreshold;
    });

    return {
      marketRecommendations: filteredMarkets,
      logisticsRecommendations: filteredLogistics,
      researchRecommendations: baseRecommendations.researchRecommendations
    };
  }
}

// Factory function to create engine with data
export function createRecommendationEngine(markets?: Market[], routes?: LogisticsRoute[], reports?: ResearchReport[]) {
  return new RecommendationEngine(
    markets || mockMarkets,
    routes || mockLogisticsRoutes,
    reports || mockResearchReports
  );
}