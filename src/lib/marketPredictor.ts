import { Market } from '@/data/mockData';

export interface MarketFeatures {
  population: number;
  averageIncome: number;
  ageGroup_18_35: number;
  ageGroup_36_55: number;
  ageGroup_55_plus: number;
  demandScore: number;
  growthRate: number;
  competitionLevel: number; // 0=Low, 1=Medium, 2=High
  productCount: number;
}

export interface MarketPrediction {
  marketId: string;
  predictedSuccess: number; // 0-1 scale
  confidence: number;
  factors: {
    name: string;
    impact: number;
    contribution: number;
  }[];
}

export class MarketPredictor {
  private weights: number[] = [];
  private bias: number = 0;
  private featureNames: string[] = [
    'population', 'averageIncome', 'ageGroup_18_35', 'ageGroup_36_55', 'ageGroup_55_plus',
    'demandScore', 'growthRate', 'competitionLevel', 'productCount'
  ];

  constructor() {
    this.initializeModel();
  }

  // Initialize with pre-trained weights (simulated training)
  private initializeModel(): void {
    // These weights are based on domain knowledge and would be learned from data in production
    this.weights = [
      0.000001,  // population (scaled)
      0.00001,   // averageIncome (scaled)
      0.3,       // ageGroup_18_35
      0.2,       // ageGroup_36_55
      0.1,       // ageGroup_55_plus
      0.4,       // demandScore
      0.3,       // growthRate
      -0.2,      // competitionLevel (negative impact)
      0.1        // productCount
    ];
    this.bias = 0.1;
  }

  // Extract features from market data
  private extractFeatures(market: Market): MarketFeatures {
    return {
      population: market.demographics.population,
      averageIncome: market.demographics.averageIncome,
      ageGroup_18_35: market.demographics.ageGroups['18-35'] / 100,
      ageGroup_36_55: market.demographics.ageGroups['36-55'] / 100,
      ageGroup_55_plus: market.demographics.ageGroups['55+'] / 100,
      demandScore: market.demandScore / 10, // Normalize to 0-1
      growthRate: market.growthRate / 20, // Normalize to 0-1
      competitionLevel: market.competition === 'Low' ? 0 : market.competition === 'Medium' ? 1 : 2,
      productCount: market.products.length
    };
  }

  // Convert features to numerical array
  private featuresToArray(features: MarketFeatures): number[] {
    return [
      features.population,
      features.averageIncome,
      features.ageGroup_18_35,
      features.ageGroup_36_55,
      features.ageGroup_55_plus,
      features.demandScore,
      features.growthRate,
      features.competitionLevel,
      features.productCount
    ];
  }

  // Predict market success using linear regression
  predict(market: Market): MarketPrediction {
    const features = this.extractFeatures(market);
    const featureArray = this.featuresToArray(features);

    // Calculate prediction using dot product
    let prediction = this.bias;
    for (let i = 0; i < this.weights.length; i++) {
      prediction += this.weights[i] * featureArray[i];
    }

    // Apply sigmoid to get probability between 0 and 1
    const predictedSuccess = 1 / (1 + Math.exp(-prediction));

    // Calculate confidence based on feature variance
    const confidence = this.calculateConfidence(featureArray);

    // Calculate factor contributions
    const factors = this.calculateFactors(features, featureArray);

    return {
      marketId: market.id,
      predictedSuccess,
      confidence,
      factors
    };
  }

  // Calculate confidence based on feature values
  private calculateConfidence(featureArray: number[]): number {
    // Higher confidence when features are in reasonable ranges
    const populationScore = Math.min(featureArray[0] / 50000, 1);
    const incomeScore = Math.min(featureArray[1] / 100000, 1);
    const demandScore = featureArray[5];
    const growthScore = featureArray[6];

    return (populationScore + incomeScore + demandScore + growthScore) / 4;
  }

  // Calculate contribution of each factor
  private calculateFactors(features: MarketFeatures, featureArray: number[]): MarketPrediction['factors'] {
    const factors: MarketPrediction['factors'] = [];

    for (let i = 0; i < this.featureNames.length; i++) {
      const impact = this.weights[i];
      const contribution = impact * featureArray[i];

      factors.push({
        name: this.featureNames[i],
        impact,
        contribution
      });
    }

    return factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  }

  // Batch predict for multiple markets
  predictBatch(markets: Market[]): MarketPrediction[] {
    return markets.map(market => this.predict(market));
  }

  // Get market ranking based on predictions
  rankMarkets(markets: Market[]): Array<{ market: Market; prediction: MarketPrediction; rank: number }> {
    const predictions = this.predictBatch(markets);

    return predictions
      .map((prediction, index) => ({
        market: markets[index],
        prediction,
        rank: 0
      }))
      .sort((a, b) => b.prediction.predictedSuccess - a.prediction.predictedSuccess)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  // Update model with new training data (online learning)
  updateModel(market: Market, actualSuccess: number, learningRate: number = 0.01): void {
    const features = this.extractFeatures(market);
    const featureArray = this.featuresToArray(features);

    const prediction = this.predict(market).predictedSuccess;
    const error = actualSuccess - prediction;

    // Update weights using gradient descent
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += learningRate * error * featureArray[i];
    }

    // Update bias
    this.bias += learningRate * error;
  }

  // Get model statistics
  getModelStats(): {
    weights: number[];
    bias: number;
    featureNames: string[];
  } {
    return {
      weights: [...this.weights],
      bias: this.bias,
      featureNames: [...this.featureNames]
    };
  }
}

// Factory function
export function createMarketPredictor(): MarketPredictor {
  return new MarketPredictor();
}