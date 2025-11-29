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

export interface UserInteraction {
  id: string;
  userId: string;
  itemType: 'market' | 'logistics' | 'research';
  itemId: string;
  interactionType: 'view' | 'save' | 'contact' | 'analyze';
  timestamp: Date;
  rating?: number; // 1-5 scale for explicit feedback
}

export interface UserPreferences {
  userId: string;
  preferredLocations: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  budgetRange: { min: number; max: number };
  productInterests: string[];
  logisticsPriorities: ('cost' | 'speed' | 'reliability')[];
  lastUpdated: Date;
}

export interface MarketRecommendation {
  market: import('@/data/mockData').Market;
  score: number;
  reason: string;
  relatedReports: import('@/data/mockData').ResearchReport[];
  suggestedRoutes: import('@/data/mockData').LogisticsRoute[];
}

export interface LogisticsRecommendation {
  route: import('@/data/mockData').LogisticsRoute;
  bestProvider: import('@/data/mockData').LogisticsProvider;
  score: number;
  reason: string;
}

export interface ResearchRecommendation {
  report: import('@/data/mockData').ResearchReport;
  relevanceScore: number;
  matchingTags: string[];
}