import { LogisticsProvider, LogisticsRoute } from '@/data/mockData';

export interface BanditContext {
  origin: string;
  destination: string;
  distance: number;
  urgency: 'low' | 'medium' | 'high';
  cargoType: 'general' | 'perishable' | 'fragile' | 'bulk';
}

export interface BanditArm {
  provider: LogisticsProvider;
  pulls: number; // number of times selected
  rewards: number; // cumulative reward
  value: number; // estimated value (rewards/pulls)
  variance: number; // for UCB calculation
}

export class ContextualBandits {
  private arms: Map<string, BanditArm[]> = new Map(); // routeId -> arms
  private alpha: number = 0.1; // learning rate
  private explorationFactor: number = 1.0; // UCB exploration parameter

  constructor() {
    // Initialize with some exploration data
    this.initializeArms();
  }

  private initializeArms(): void {
    // This would typically load from persistent storage
    // For demo, we'll initialize when routes are processed
  }

  // LinUCB algorithm for contextual bandits
  selectProvider(route: LogisticsRoute, context: BanditContext): LogisticsProvider {
    const routeKey = `${route.origin}-${route.destination}`;
    let arms = this.arms.get(routeKey);

    if (!arms) {
      // Initialize arms for this route
      arms = route.providers.map(provider => ({
        provider,
        pulls: 1, // Start with 1 to avoid division by zero
        rewards: Math.random() * 0.5 + 0.5, // Random initial reward
        value: 0.5,
        variance: 1.0
      }));
      this.arms.set(routeKey, arms);
    }

    // Calculate context features
    const features = this.extractFeatures(context);

    // Calculate UCB scores for each arm
    const scores = arms.map((arm, index) => {
      const exploitation = arm.value;
      const exploration = this.explorationFactor * Math.sqrt(Math.log(arms!.reduce((sum, a) => sum + a.pulls, 0)) / arm.pulls);
      const contextualBonus = this.calculateContextualBonus(arm, features);

      return {
        index,
        score: exploitation + exploration + contextualBonus
      };
    });

    // Select arm with highest score
    const selected = scores.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    return arms[selected.index].provider;
  }

  // Update the bandit with reward feedback
  updateReward(route: LogisticsRoute, provider: LogisticsProvider, reward: number): void {
    const routeKey = `${route.origin}-${route.destination}`;
    const arms = this.arms.get(routeKey);

    if (!arms) return;

    const armIndex = arms.findIndex(arm => arm.provider.id === provider.id);
    if (armIndex === -1) return;

    const arm = arms[armIndex];

    // Update statistics using incremental learning
    arm.pulls += 1;
    arm.rewards += reward;
    arm.value = arm.rewards / arm.pulls;

    // Update variance estimate (simplified)
    const oldValue = arm.value - (reward - arm.value) / arm.pulls;
    arm.variance = Math.abs(reward - oldValue);
  }

  // Extract numerical features from context
  private extractFeatures(context: BanditContext): number[] {
    return [
      context.distance / 1000, // normalized distance
      context.urgency === 'high' ? 1 : context.urgency === 'medium' ? 0.5 : 0,
      context.cargoType === 'perishable' ? 1 : context.cargoType === 'fragile' ? 0.8 :
      context.cargoType === 'bulk' ? 0.6 : 0.3
    ];
  }

  // Calculate contextual bonus based on provider characteristics
  private calculateContextualBonus(arm: BanditArm, features: number[]): number {
    const provider = arm.provider;

    // Distance factor (prefer providers with better reliability for long distances)
    const distanceFactor = features[0] > 0.5 ? provider.reliability / 100 : 0.5;

    // Urgency factor (prefer faster providers for urgent cargo)
    const durationHours = this.parseDuration(provider.duration);
    const urgencyFactor = features[1] * (1 / Math.max(durationHours, 1)); // Lower duration = higher bonus

    // Cargo type factor (prefer reliable providers for fragile/perishable)
    const cargoFactor = features[2] * (provider.reliability / 100);

    return (distanceFactor + urgencyFactor + cargoFactor) * 0.1; // Scale down the bonus
  }

  // Get provider recommendations with confidence scores
  getProviderRecommendations(route: LogisticsRoute, context: BanditContext, limit: number = 3): Array<{
    provider: LogisticsProvider;
    score: number;
    confidence: number;
  }> {
    const routeKey = `${route.origin}-${route.destination}`;
    const arms = this.arms.get(routeKey) || [];

    if (arms.length === 0) {
      // Return providers sorted by base rating if no bandit data
      return route.providers
        .map(provider => ({
          provider,
          score: (provider.rating + provider.reliability / 20) / 2,
          confidence: 0.5
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    const features = this.extractFeatures(context);

    return arms
      .map(arm => {
        const exploitation = arm.value;
        const exploration = this.explorationFactor * Math.sqrt(Math.log(arms.reduce((sum, a) => sum + a.pulls, 0)) / arm.pulls);
        const contextualBonus = this.calculateContextualBonus(arm, features);
        const score = exploitation + exploration + contextualBonus;
        const confidence = Math.min(arm.pulls / 10, 1); // Confidence based on number of trials

        return {
          provider: arm.provider,
          score,
          confidence
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Simulate provider performance and provide reward
  simulateProviderPerformance(route: LogisticsRoute, provider: LogisticsProvider, context: BanditContext): number {
    // Simulate delivery success based on provider reliability and context
    const baseSuccess = provider.reliability / 100;
    const contextModifier = context.urgency === 'high' ? -0.1 :
                           context.cargoType === 'perishable' ? -0.05 : 0.05;

    const actualSuccess = Math.max(0, Math.min(1, baseSuccess + contextModifier + (Math.random() - 0.5) * 0.2));

    // Reward is based on success, cost efficiency, and timeliness
    const costEfficiency = Math.max(0, 1 - (provider.cost - route.costRange.min) / (route.costRange.max - route.costRange.min));
    const reward = actualSuccess * 0.7 + costEfficiency * 0.3;

    // Update the bandit
    this.updateReward(route, provider, reward);

    return reward;
  }

  // Parse duration string to hours
  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 8; // Default to 8 hours if parsing fails
  }

  // Get bandit statistics for monitoring
  getStatistics(): { [routeKey: string]: { totalPulls: number; bestArm: BanditArm | null } } {
    const stats: { [routeKey: string]: { totalPulls: number; bestArm: BanditArm | null } } = {};

    this.arms.forEach((arms, routeKey) => {
      const totalPulls = arms.reduce((sum, arm) => sum + arm.pulls, 0);
      const bestArm = arms.reduce((best, current) =>
        current.value > best.value ? current : best
      );

      stats[routeKey] = { totalPulls, bestArm };
    });

    return stats;
  }
}

// Factory function
export function createContextualBandits(): ContextualBandits {
  return new ContextualBandits();
}