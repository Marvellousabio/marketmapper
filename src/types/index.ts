export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  location?: string;
  businessType?: string;
  skills?: string[];
}

export interface MarketAnalysis {
  id: string;
  userId: string;
  location: string;
  demographics: {
    ageGroups: { [key: string]: number };
    incomeLevels: { [key: string]: number };
    interests: string[];
  };
  trends: {
    socialMedia: string[];
    searchTerms: string[];
    competitorActivity: string[];
  };
  demandGaps: {
    highDemand: string[];
    lowCompetition: string[];
    emergingTrends: string[];
  };
  createdAt: Date;
}

export interface ProductRecommendation {
  id: string;
  analysisId: string;
  product: string;
  category: string;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  suppliers: Supplier[];
  estimatedProfit: number;
  targetAudience: string;
}

export interface Supplier {
  name: string;
  location: string;
  contact: string;
  priceRange: string;
  reliability: number;
}

export interface USP {
  id: string;
  userId: string;
  product: string;
  uniqueFeatures: string[];
  targetAudience: string;
  competitiveAdvantage: string;
  valueProposition: string;
  createdAt: Date;
}

export interface LogisticsPlan {
  id: string;
  userId: string;
  location: string;
  transportationMethods: {
    type: string;
    cost: number;
    reliability: number;
    speed: string;
  }[];
  routes: Route[];
  partners: LogisticsPartner[];
  estimatedDeliveryTime: string;
  totalCost: number;
}

export interface Route {
  from: string;
  to: string;
  distance: number;
  estimatedTime: string;
  trafficConditions: string;
}

export interface LogisticsPartner {
  name: string;
  type: string;
  contact: string;
  coverage: string;
  rating: number;
}

export interface MarketResearch {
  id: string;
  userId: string;
  type: 'survey' | 'focus_group' | 'interview' | 'social_listening';
  questions: string[];
  responses: ResearchResponse[];
  insights: string[];
  createdAt: Date;
}

export interface ResearchResponse {
  question: string;
  answer: string | string[];
  respondentId: string;
  timestamp: Date;
}