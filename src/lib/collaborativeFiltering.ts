import { UserInteraction, UserPreferences } from '@/types';
import { Market, LogisticsRoute, ResearchReport } from '@/data/mockData';
import { MarketRecommendation, LogisticsRecommendation, ResearchRecommendation } from '@/types';

export class CollaborativeFilteringEngine {
  private interactions: UserInteraction[];
  private preferences: UserPreferences[];

  constructor(interactions: UserInteraction[] = [], preferences: UserPreferences[] = []) {
    this.interactions = interactions;
    this.preferences = preferences;
  }

  // Calculate similarity between two users using Pearson correlation
  private calculateUserSimilarity(userId1: string, userId2: string): number {
    const user1Interactions = this.interactions.filter(i => i.userId === userId1);
    const user2Interactions = this.interactions.filter(i => i.userId === userId2);

    if (user1Interactions.length === 0 || user2Interactions.length === 0) return 0;

    // Create rating maps
    const user1Ratings = new Map<string, number>();
    const user2Ratings = new Map<string, number>();

    user1Interactions.forEach(i => {
      const rating = i.rating || this.interactionToRating(i.interactionType);
      user1Ratings.set(`${i.itemType}-${i.itemId}`, rating);
    });

    user2Interactions.forEach(i => {
      const rating = i.rating || this.interactionToRating(i.interactionType);
      user2Ratings.set(`${i.itemType}-${i.itemId}`, rating);
    });

    // Find common items
    const commonItems = Array.from(user1Ratings.keys()).filter(key => user2Ratings.has(key));

    if (commonItems.length === 0) return 0;

    // Calculate Pearson correlation
    const n = commonItems.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    commonItems.forEach(item => {
      const r1 = user1Ratings.get(item)!;
      const r2 = user2Ratings.get(item)!;

      sum1 += r1;
      sum2 += r2;
      sum1Sq += r1 * r1;
      sum2Sq += r2 * r2;
      pSum += r1 * r2;
    });

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    return den === 0 ? 0 : num / den;
  }

  // Convert interaction type to rating
  private interactionToRating(interactionType: string): number {
    switch (interactionType) {
      case 'contact': return 5;
      case 'save': return 4;
      case 'analyze': return 4;
      case 'view': return 3;
      default: return 3;
    }
  }

  // Find similar users
  private findSimilarUsers(userId: string, limit: number = 10): Array<{ userId: string; similarity: number }> {
    const allUserIds = [...new Set(this.interactions.map(i => i.userId))].filter(id => id !== userId);

    const similarities = allUserIds.map(otherUserId => ({
      userId: otherUserId,
      similarity: this.calculateUserSimilarity(userId, otherUserId)
    }));

    return similarities
      .filter(s => s.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Generate collaborative filtering recommendations
  generateCollaborativeRecommendations(
    userId: string,
    markets: Market[],
    routes: LogisticsRoute[],
    reports: ResearchReport[]
  ): {
    marketRecommendations: MarketRecommendation[];
    logisticsRecommendations: LogisticsRecommendation[];
    researchRecommendations: ResearchRecommendation[];
  } {
    const similarUsers = this.findSimilarUsers(userId);

    if (similarUsers.length === 0) {
      return {
        marketRecommendations: [],
        logisticsRecommendations: [],
        researchRecommendations: []
      };
    }

    // Get items that similar users have interacted with but current user hasn't
    const currentUserInteractions = new Set(
      this.interactions
        .filter(i => i.userId === userId)
        .map(i => `${i.itemType}-${i.itemId}`)
    );

    const itemScores = new Map<string, { score: number; count: number }>();

    // Calculate weighted scores from similar users
    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarUserInteractions = this.interactions.filter(i => i.userId === similarUserId);

      similarUserInteractions.forEach(interaction => {
        const itemKey = `${interaction.itemType}-${interaction.itemId}`;

        if (!currentUserInteractions.has(itemKey)) {
          const rating = interaction.rating || this.interactionToRating(interaction.interactionType);
          const weightedScore = rating * similarity;

          const existing = itemScores.get(itemKey) || { score: 0, count: 0 };
          itemScores.set(itemKey, {
            score: existing.score + weightedScore,
            count: existing.count + 1
          });
        }
      });
    });

    // Convert to recommendations
    const marketRecommendations: MarketRecommendation[] = [];
    const logisticsRecommendations: LogisticsRecommendation[] = [];
    const researchRecommendations: ResearchRecommendation[] = [];

    itemScores.forEach(({ score, count }, itemKey) => {
      const averageScore = score / count;
      const [itemType, itemId] = itemKey.split('-');

      if (itemType === 'market') {
        const market = markets.find(m => m.id === itemId);
        if (market) {
          marketRecommendations.push({
            market,
            score: averageScore,
            reason: `Recommended by ${count} similar users`,
            relatedReports: [],
            suggestedRoutes: []
          });
        }
      } else if (itemType === 'logistics') {
        const route = routes.find(r => r.id === itemId);
        if (route) {
          const bestProvider = route.providers[0]; // Simplified
          logisticsRecommendations.push({
            route,
            bestProvider,
            score: averageScore,
            reason: `Popular among similar users`
          });
        }
      } else if (itemType === 'research') {
        const report = reports.find(r => r.id === itemId);
        if (report) {
          researchRecommendations.push({
            report,
            relevanceScore: averageScore,
            matchingTags: []
          });
        }
      }
    });

    return {
      marketRecommendations: marketRecommendations.sort((a, b) => b.score - a.score),
      logisticsRecommendations: logisticsRecommendations.sort((a, b) => b.score - a.score),
      researchRecommendations: researchRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)
    };
  }

  // Add user interaction
  addInteraction(interaction: UserInteraction): void {
    this.interactions.push(interaction);
  }

  // Update user preferences
  updatePreferences(preferences: UserPreferences): void {
    const existingIndex = this.preferences.findIndex(p => p.userId === preferences.userId);
    if (existingIndex >= 0) {
      this.preferences[existingIndex] = preferences;
    } else {
      this.preferences.push(preferences);
    }
  }

  // Get personalized recommendations based on preferences
  generatePersonalizedRecommendations(
    userId: string,
    markets: Market[],
    routes: LogisticsRoute[],
    reports: ResearchReport[]
  ): {
    marketRecommendations: MarketRecommendation[];
    logisticsRecommendations: LogisticsRecommendation[];
    researchRecommendations: ResearchRecommendation[];
  } {
    const userPrefs = this.preferences.find(p => p.userId === userId);

    if (!userPrefs) {
      return this.generateCollaborativeRecommendations(userId, markets, routes, reports);
    }

    // Filter based on preferences
    const filteredMarkets = markets.filter(market => {
      const locationMatch = userPrefs.preferredLocations.length === 0 ||
        userPrefs.preferredLocations.some(loc =>
          market.location.address.toLowerCase().includes(loc.toLowerCase())
        );

      const productMatch = userPrefs.productInterests.length === 0 ||
        userPrefs.productInterests.some(product =>
          market.products.some(marketProduct =>
            marketProduct.toLowerCase().includes(product.toLowerCase())
          )
        );

      return locationMatch && productMatch;
    });

    const filteredRoutes = routes.filter(route => {
      // Filter routes based on budget and priorities
      const withinBudget = route.costRange.max <= userPrefs.budgetRange.max;
      return withinBudget;
    });

    const filteredReports = reports.filter(report => {
      const tagMatch = userPrefs.productInterests.length === 0 ||
        userPrefs.productInterests.some(interest =>
          report.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
        );
      return tagMatch;
    });

    // Get collaborative recommendations from filtered data
    const collabRecs = this.generateCollaborativeRecommendations(userId, filteredMarkets, filteredRoutes, filteredReports);

    // Apply risk adjustment
    const riskMultiplier = userPrefs.riskTolerance === 'high' ? 1.2 :
                          userPrefs.riskTolerance === 'low' ? 0.8 : 1.0;

    collabRecs.marketRecommendations.forEach(rec => {
      rec.score *= riskMultiplier;
    });

    return collabRecs;
  }
}

// Mock data for demonstration
export const mockUserInteractions: UserInteraction[] = [
  {
    id: '1',
    userId: 'user1',
    itemType: 'market',
    itemId: '1',
    interactionType: 'view',
    timestamp: new Date('2024-11-01')
  },
  {
    id: '2',
    userId: 'user1',
    itemType: 'market',
    itemId: '3',
    interactionType: 'save',
    timestamp: new Date('2024-11-02')
  },
  {
    id: '3',
    userId: 'user2',
    itemType: 'market',
    itemId: '3',
    interactionType: 'contact',
    timestamp: new Date('2024-11-01')
  },
  {
    id: '4',
    userId: 'user2',
    itemType: 'logistics',
    itemId: '1',
    interactionType: 'analyze',
    timestamp: new Date('2024-11-03')
  }
];

export const mockUserPreferences: UserPreferences[] = [
  {
    userId: 'user1',
    preferredLocations: ['Lagos'],
    riskTolerance: 'medium',
    budgetRange: { min: 10000, max: 50000 },
    productInterests: ['Electronics', 'Fashion'],
    logisticsPriorities: ['reliability', 'cost'],
    lastUpdated: new Date()
  }
];