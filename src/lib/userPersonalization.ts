import { UserInteraction, UserPreferences } from '@/types';
import { Market, LogisticsRoute, ResearchReport } from '@/data/mockData';

export interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  interactionHistory: UserInteraction[];
  behaviorPatterns: {
    preferredTimes: string[]; // e.g., ['morning', 'afternoon']
    interactionFrequency: number; // interactions per day
    riskTolerance: 'low' | 'medium' | 'high';
    budgetRange: { min: number; max: number };
    locationPreferences: string[];
    productInterests: string[];
    logisticsPriorities: ('cost' | 'speed' | 'reliability')[];
  };
  recommendationHistory: {
    acceptedRecommendations: string[];
    rejectedRecommendations: string[];
    conversionRate: number;
  };
  lastActive: Date;
}

export interface PersonalizationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  sessionLength: number; // minutes
  previousInteractions: number; // in current session
  userEngagement: 'low' | 'medium' | 'high';
}

export class UserPersonalizationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    // Initialize with mock data
    this.initializeMockProfiles();
  }

  private initializeMockProfiles(): void {
    // Mock user profiles for demonstration
    const mockProfile: UserProfile = {
      userId: 'user1',
      preferences: {
        userId: 'user1',
        preferredLocations: ['Lagos', 'Abuja'],
        riskTolerance: 'medium',
        budgetRange: { min: 15000, max: 50000 },
        productInterests: ['Electronics', 'Fashion'],
        logisticsPriorities: ['reliability', 'cost'],
        lastUpdated: new Date()
      },
      interactionHistory: [],
      behaviorPatterns: {
        preferredTimes: ['morning', 'afternoon'],
        interactionFrequency: 2.5,
        riskTolerance: 'medium',
        budgetRange: { min: 15000, max: 50000 },
        locationPreferences: ['Lagos', 'Abuja'],
        productInterests: ['Electronics', 'Fashion'],
        logisticsPriorities: ['reliability', 'cost']
      },
      recommendationHistory: {
        acceptedRecommendations: ['market-1', 'logistics-1'],
        rejectedRecommendations: ['market-2'],
        conversionRate: 0.67
      },
      lastActive: new Date()
    };

    this.userProfiles.set('user1', mockProfile);
  }

  // Get or create user profile
  getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      const newProfile: UserProfile = {
        userId,
        preferences: {
          userId,
          preferredLocations: [],
          riskTolerance: 'medium',
          budgetRange: { min: 10000, max: 100000 },
          productInterests: [],
          logisticsPriorities: ['cost', 'reliability'],
          lastUpdated: new Date()
        },
        interactionHistory: [],
        behaviorPatterns: {
          preferredTimes: ['morning'],
          interactionFrequency: 1,
          riskTolerance: 'medium',
          budgetRange: { min: 10000, max: 100000 },
          locationPreferences: [],
          productInterests: [],
          logisticsPriorities: ['cost', 'reliability']
        },
        recommendationHistory: {
          acceptedRecommendations: [],
          rejectedRecommendations: [],
          conversionRate: 0
        },
        lastActive: new Date()
      };
      this.userProfiles.set(userId, newProfile);
    }
    return this.userProfiles.get(userId)!;
  }

  // Update user preferences
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const profile = this.getUserProfile(userId);
    profile.preferences = { ...profile.preferences, ...preferences, lastUpdated: new Date() };
    this.updateBehaviorPatterns(userId);
  }

  // Record user interaction
  recordInteraction(userId: string, interaction: UserInteraction): void {
    const profile = this.getUserProfile(userId);
    profile.interactionHistory.push(interaction);
    profile.lastActive = new Date();

    // Keep only last 1000 interactions to prevent memory issues
    if (profile.interactionHistory.length > 1000) {
      profile.interactionHistory = profile.interactionHistory.slice(-1000);
    }

    this.updateBehaviorPatterns(userId);
  }

  // Update behavior patterns based on interaction history
  private updateBehaviorPatterns(userId: string): void {
    const profile = this.getUserProfile(userId);
    const interactions = profile.interactionHistory;

    if (interactions.length === 0) return;

    // Analyze preferred times
    const hourCounts = new Map<number, number>();
    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const preferredHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
      });

    // Calculate interaction frequency (interactions per day over last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInteractions = interactions.filter(i => i.timestamp > thirtyDaysAgo);
    const frequency = recentInteractions.length / 30;

    // Analyze product interests
    const productCounts = new Map<string, number>();
    interactions.forEach(interaction => {
      if (interaction.itemType === 'market') {
        // This would need market data to map itemId to products
        // For now, we'll use a simplified approach
      }
    });

    profile.behaviorPatterns = {
      ...profile.behaviorPatterns,
      preferredTimes: [...new Set(preferredHours)],
      interactionFrequency: frequency,
      riskTolerance: profile.preferences.riskTolerance,
      budgetRange: profile.preferences.budgetRange,
      locationPreferences: profile.preferences.preferredLocations,
      productInterests: profile.preferences.productInterests,
      logisticsPriorities: profile.preferences.logisticsPriorities
    };
  }

  // Get personalized recommendations based on user profile and context
  getPersonalizedRecommendations(
    userId: string,
    context: PersonalizationContext,
    baseRecommendations: {
      markets: Market[];
      routes: LogisticsRoute[];
      reports: ResearchReport[];
    }
  ): {
    markets: Market[];
    routes: LogisticsRoute[];
    reports: ResearchReport[];
    reasoning: string[];
  } {
    const profile = this.getUserProfile(userId);
    const reasoning: string[] = [];

    // Time-based personalization
    let timeMultiplier = 1;
    if (profile.behaviorPatterns.preferredTimes.includes(context.timeOfDay)) {
      timeMultiplier = 1.2;
      reasoning.push(`Preferred time of day: ${context.timeOfDay}`);
    }

    // Engagement-based personalization
    let engagementMultiplier = 1;
    if (context.userEngagement === 'high') {
      engagementMultiplier = 1.3;
      reasoning.push('High user engagement detected');
    } else if (context.userEngagement === 'low') {
      engagementMultiplier = 0.8;
      reasoning.push('Low user engagement - showing familiar options');
    }

    // Filter and score markets based on preferences
    const scoredMarkets = baseRecommendations.markets
      .map(market => {
        let score = 1;

        // Location preference
        if (profile.preferences.preferredLocations.length > 0) {
          const locationMatch = profile.preferences.preferredLocations.some(loc =>
            market.location.address.toLowerCase().includes(loc.toLowerCase())
          );
          if (locationMatch) {
            score *= 1.5;
            reasoning.push(`Location preference match: ${market.location.address}`);
          }
        }

        // Product interest
        if (profile.preferences.productInterests.length > 0) {
          const productMatch = profile.preferences.productInterests.some(interest =>
            market.products.some(product =>
              product.toLowerCase().includes(interest.toLowerCase())
            )
          );
          if (productMatch) {
            score *= 1.3;
            reasoning.push(`Product interest match: ${market.products.join(', ')}`);
          }
        }

        // Risk tolerance
        const marketRisk = this.assessMarketRiskForProfile(market, profile);
        if (marketRisk <= this.getRiskThreshold(profile.preferences.riskTolerance)) {
          score *= 1.2;
        }

        // Apply context multipliers
        score *= timeMultiplier * engagementMultiplier;

        return { market, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.market);

    // Filter and score routes
    const scoredRoutes = baseRecommendations.routes
      .map(route => {
        let score = 1;

        // Budget compatibility
        const avgCost = (route.costRange.min + route.costRange.max) / 2;
        if (avgCost >= profile.preferences.budgetRange.min &&
            avgCost <= profile.preferences.budgetRange.max) {
          score *= 1.4;
          reasoning.push(`Budget compatible route: ₦${avgCost.toLocaleString()}`);
        }

        // Logistics priorities
        const bestProvider = route.providers[0]; // Simplified
        if (profile.preferences.logisticsPriorities.includes('reliability') &&
            bestProvider.reliability > 85) {
          score *= 1.2;
          reasoning.push('High reliability provider prioritized');
        }

        return { route, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.route);

    // Filter reports based on interests
    const filteredReports = baseRecommendations.reports
      .filter(report => {
        if (profile.preferences.productInterests.length === 0) return true;

        return profile.preferences.productInterests.some(interest =>
          report.tags.some(tag =>
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        );
      });

    return {
      markets: scoredMarkets,
      routes: scoredRoutes,
      reports: filteredReports,
      reasoning
    };
  }

  // Assess market risk relative to user profile
  private assessMarketRiskForProfile(market: Market, profile: UserProfile): number {
    // Simplified risk assessment based on user tolerance
    let risk = 0.5; // Base risk

    if (market.competition === 'High') risk += 0.3;
    if (market.demandScore < 7) risk += 0.2;
    if (market.growthRate < 5) risk += 0.2;

    // Adjust based on user risk tolerance
    const toleranceAdjustment = profile.preferences.riskTolerance === 'high' ? -0.2 :
                               profile.preferences.riskTolerance === 'low' ? 0.2 : 0;

    return Math.max(0, Math.min(1, risk + toleranceAdjustment));
  }

  // Get risk threshold based on tolerance
  private getRiskThreshold(tolerance: 'low' | 'medium' | 'high'): number {
    switch (tolerance) {
      case 'low': return 0.3;
      case 'medium': return 0.6;
      case 'high': return 0.9;
      default: return 0.6;
    }
  }

  // Get user analytics
  getUserAnalytics(userId: string): {
    totalInteractions: number;
    avgSessionLength: number;
    topInterests: string[];
    conversionRate: number;
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
  } {
    const profile = this.getUserProfile(userId);
    const interactions = profile.interactionHistory;

    // Calculate analytics
    const totalInteractions = interactions.length;

    // Simple engagement trend (mock)
    const engagementTrend = totalInteractions > 10 ? 'increasing' :
                           totalInteractions > 5 ? 'stable' : 'decreasing';

    return {
      totalInteractions,
      avgSessionLength: 15, // Mock value
      topInterests: profile.preferences.productInterests,
      conversionRate: profile.recommendationHistory.conversionRate,
      engagementTrend
    };
  }

  // Export user data for backup/analysis
  exportUserData(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  // Import user data
  importUserData(profile: UserProfile): void {
    this.userProfiles.set(profile.userId, profile);
  }
}

// Factory function
export function createUserPersonalizationEngine(): UserPersonalizationEngine {
  return new UserPersonalizationEngine();

}
