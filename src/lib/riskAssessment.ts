import { Market, LogisticsRoute, LogisticsProvider } from '@/data/mockData';

export interface RiskFactors {
  marketVolatility: number; // 0-1 scale
  competitionIntensity: number; // 0-1 scale
  economicInstability: number; // 0-1 scale
  regulatoryRisk: number; // 0-1 scale
  logisticsReliability: number; // 0-1 scale
  demandUncertainty: number; // 0-1 scale
}

export interface RiskAssessment {
  overallRisk: number; // 0-1 scale (0 = low risk, 1 = high risk)
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  factors: RiskFactors;
  recommendations: string[];
  mitigationStrategies: string[];
}

export class RiskAssessor {
  // Assess market risk based on various factors
  assessMarketRisk(market: Market): RiskAssessment {
    const factors: RiskFactors = {
      marketVolatility: this.calculateMarketVolatility(market),
      competitionIntensity: this.calculateCompetitionIntensity(market),
      economicInstability: this.calculateEconomicInstability(market),
      regulatoryRisk: this.calculateRegulatoryRisk(market),
      logisticsReliability: this.calculateLogisticsReliability(market),
      demandUncertainty: this.calculateDemandUncertainty(market)
    };

    // Weighted average of risk factors
    const weights = {
      marketVolatility: 0.2,
      competitionIntensity: 0.25,
      economicInstability: 0.15,
      regulatoryRisk: 0.15,
      logisticsReliability: 0.15,
      demandUncertainty: 0.1
    };

    const overallRisk = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof RiskFactors];
    }, 0);

    const riskLevel = this.getRiskLevel(overallRisk);
    const recommendations = this.generateMarketRecommendations(market, factors, riskLevel);
    const mitigationStrategies = this.generateMitigationStrategies(factors, riskLevel);

    return {
      overallRisk,
      riskLevel,
      factors,
      recommendations,
      mitigationStrategies
    };
  }

  // Assess logistics route risk
  assessLogisticsRisk(route: LogisticsRoute, provider: LogisticsProvider): RiskAssessment {
    const factors: RiskFactors = {
      marketVolatility: 0, // Not applicable for logistics
      competitionIntensity: this.calculateProviderCompetition(route),
      economicInstability: this.calculateEconomicImpact(route),
      regulatoryRisk: this.calculateLogisticsRegulatoryRisk(route),
      logisticsReliability: this.calculateProviderReliability(provider),
      demandUncertainty: this.calculateRouteDemandUncertainty(route)
    };

    // Different weights for logistics
    const weights = {
      marketVolatility: 0,
      competitionIntensity: 0.2,
      economicInstability: 0.2,
      regulatoryRisk: 0.2,
      logisticsReliability: 0.3,
      demandUncertainty: 0.1
    };

    const overallRisk = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof RiskFactors];
    }, 0);

    const riskLevel = this.getRiskLevel(overallRisk);
    const recommendations = this.generateLogisticsRecommendations(route, provider, factors, riskLevel);
    const mitigationStrategies = this.generateLogisticsMitigationStrategies(factors, riskLevel);

    return {
      overallRisk,
      riskLevel,
      factors,
      recommendations,
      mitigationStrategies
    };
  }

  private calculateMarketVolatility(market: Market): number {
    // Based on growth rate variability and market size
    const growthVolatility = Math.abs(market.growthRate - 10) / 20; // Distance from average growth
    const sizeVolatility = market.demographics.population < 20000 ? 0.8 :
                          market.demographics.population < 30000 ? 0.5 : 0.2;
    return Math.min(1, (growthVolatility + sizeVolatility) / 2);
  }

  private calculateCompetitionIntensity(market: Market): number {
    const competitionMap = { 'Low': 0.2, 'Medium': 0.6, 'High': 0.9 };
    return competitionMap[market.competition];
  }

  private calculateEconomicInstability(market: Market): number {
    // Based on income distribution and market location
    const incomeVariability = market.demographics.averageIncome < 40000 ? 0.8 :
                             market.demographics.averageIncome < 60000 ? 0.5 : 0.2;

    // Different regions have different economic stability
    const locationRisk = market.location.address.includes('Lagos') ? 0.3 :
                        market.location.address.includes('Abuja') ? 0.4 :
                        market.location.address.includes('Kano') ? 0.6 : 0.5;

    return (incomeVariability + locationRisk) / 2;
  }

  private calculateRegulatoryRisk(market: Market): number {
    // Based on market type and location
    let risk = 0.3; // Base regulatory risk

    if (market.products.includes('Oil Services')) risk += 0.4;
    if (market.products.includes('Construction')) risk += 0.2;
    if (market.location.address.includes('Port Harcourt')) risk += 0.2; // Oil region

    return Math.min(1, risk);
  }

  private calculateLogisticsReliability(market: Market): number {
    // Based on market location accessibility
    const locationAccessibility = market.location.address.includes('Lagos') ? 0.2 :
                                 market.location.address.includes('Abuja') ? 0.3 :
                                 market.location.address.includes('Kano') ? 0.5 : 0.4;

    return locationAccessibility;
  }

  private calculateDemandUncertainty(market: Market): number {
    // Based on demand score variability and product diversity
    const demandVariability = market.demandScore < 7 ? 0.8 :
                             market.demandScore < 8.5 ? 0.5 : 0.2;
    const productDiversity = market.products.length < 3 ? 0.7 :
                            market.products.length < 5 ? 0.4 : 0.1;

    return (demandVariability + productDiversity) / 2;
  }

  private calculateProviderCompetition(route: LogisticsRoute): number {
    return route.providers.length < 2 ? 0.8 : route.providers.length < 4 ? 0.5 : 0.2;
  }

  private calculateEconomicImpact(route: LogisticsRoute): number {
    // Routes with higher costs have higher economic risk
    const avgCost = (route.costRange.min + route.costRange.max) / 2;
    return Math.min(1, avgCost / 50000); // Normalize against high cost threshold
  }

  private calculateLogisticsRegulatoryRisk(route: LogisticsRoute): number {
    // Cross-state routes have higher regulatory risk
    const isInterstate = route.origin !== route.destination.split(',')[0]?.trim();
    return isInterstate ? 0.6 : 0.3;
  }

  private calculateProviderReliability(provider: LogisticsProvider): number {
    return (100 - provider.reliability) / 100; // Invert reliability to get risk
  }

  private calculateRouteDemandUncertainty(route: LogisticsRoute): number {
    // Based on route distance and frequency
    const distanceRisk = route.distance > 1000 ? 0.8 :
                        route.distance > 500 ? 0.5 : 0.2;
    return distanceRisk;
  }

  private getRiskLevel(risk: number): 'low' | 'medium' | 'high' | 'very_high' {
    if (risk < 0.3) return 'low';
    if (risk < 0.5) return 'medium';
    if (risk < 0.7) return 'high';
    return 'very_high';
  }

  private generateMarketRecommendations(market: Market, factors: RiskFactors, riskLevel: string): string[] {
    console.log('Debug: riskLevel in generateMarketRecommendations:', riskLevel);
    const recommendations: string[] = [];

    if (factors.competitionIntensity > 0.7) {
      recommendations.push('Consider niche products to differentiate from competitors');
    }

    if (factors.economicInstability > 0.6) {
      recommendations.push('Monitor economic indicators and have contingency plans');
    }

    if (factors.demandUncertainty > 0.5) {
      recommendations.push('Conduct regular market research to track demand changes');
    }

    if (factors.logisticsReliability > 0.5) {
      recommendations.push('Partner with multiple logistics providers for redundancy');
    }

    if (recommendations.length === 0) {
      recommendations.push('Market shows good risk profile, proceed with standard due diligence');
    }

    return recommendations;
  }

  private generateLogisticsRecommendations(route: LogisticsRoute, provider: LogisticsProvider, factors: RiskFactors, riskLevel: string): string[] {
    console.log('Debug: riskLevel in generateLogisticsRecommendations:', riskLevel);
    const recommendations: string[] = [];

    if (factors.logisticsReliability > 0.6) {
      recommendations.push('Consider backup logistics providers for this route');
    }

    if (factors.regulatoryRisk > 0.5) {
      recommendations.push('Ensure all necessary permits and documentation are in order');
    }

    if (factors.economicInstability > 0.5) {
      recommendations.push('Monitor fuel prices and transportation costs regularly');
    }

    if (recommendations.length === 0) {
      recommendations.push('Route shows acceptable risk levels for standard operations');
    }

    return recommendations;
  }

  private generateMitigationStrategies(factors: RiskFactors, riskLevel: string): string[] {
    const strategies: string[] = [];

    if (riskLevel === 'high' || riskLevel === 'very_high') {
      strategies.push('Implement comprehensive insurance coverage');
      strategies.push('Establish emergency response protocols');
      strategies.push('Diversify suppliers and markets');
    }

    if (factors.competitionIntensity > 0.6) {
      strategies.push('Develop unique value propositions');
      strategies.push('Build customer loyalty programs');
    }

    if (factors.economicInstability > 0.5) {
      strategies.push('Hedge against currency fluctuations');
      strategies.push('Maintain flexible pricing strategies');
    }

    if (factors.logisticsReliability > 0.5) {
      strategies.push('Invest in tracking and monitoring systems');
      strategies.push('Build relationships with multiple carriers');
    }

    return strategies;
  }

  private generateLogisticsMitigationStrategies(factors: RiskFactors, riskLevel: string): string[] {
    const strategies: string[] = [];

    if (riskLevel === 'high' || riskLevel === 'very_high') {
      strategies.push('Secure cargo insurance');
      strategies.push('Implement GPS tracking for all shipments');
      strategies.push('Establish alternative routing options');
    }

    if (factors.logisticsReliability > 0.6) {
      strategies.push('Conduct regular provider performance reviews');
      strategies.push('Maintain backup transportation agreements');
    }

    if (factors.regulatoryRisk > 0.5) {
      strategies.push('Stay updated on transportation regulations');
      strategies.push('Work with licensed and certified carriers only');
    }

    return strategies;
  }
}

// Factory function
export function createRiskAssessor(): RiskAssessor {
  return new RiskAssessor();
}