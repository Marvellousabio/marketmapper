export interface Market {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  demographics: {
    population: number;
    averageIncome: number;
    ageGroups: {
      '18-35': number;
      '36-55': number;
      '55+': number;
    };
  };
  products: string[];
  demandScore: number;
  growthRate: number;
  competition: 'Low' | 'Medium' | 'High';
}

export interface LogisticsRoute {
  id: string;
  origin: string;
  destination: string;
  distance: number; // in km
  duration: string;
  providers: LogisticsProvider[];
  costRange: {
    min: number;
    max: number;
  };
}

export interface LogisticsProvider {
  id: string;
  name: string;
  cost: number;
  duration: string;
  rating: number;
  reliability: number; // percentage
  contact: string;
}

export interface ResearchReport {
  id: string;
  title: string;
  category: 'Market Trends' | 'Consumer Behavior' | 'Economic Analysis' | 'Industry Report';
  summary: string;
  keyFindings: string[];
  date: string;
  author: string;
  tags: string[];
}

export const mockMarkets: Market[] = [
  {
    id: '1',
    name: 'Lagos Central Market',
    location: {
      lat: 6.5244,
      lng: 3.3792,
      address: 'Central Business District, Lagos'
    },
    demographics: {
      population: 25000,
      averageIncome: 45000,
      ageGroups: { '18-35': 60, '36-55': 30, '55+': 10 }
    },
    products: ['Electronics', 'Fashion', 'Food', 'Household Items'],
    demandScore: 8.5,
    growthRate: 12.5,
    competition: 'High'
  },
  {
    id: '2',
    name: 'Abuja Wuse Market',
    location: {
      lat: 9.0765,
      lng: 7.4989,
      address: 'Wuse II, Abuja'
    },
    demographics: {
      population: 18000,
      averageIncome: 65000,
      ageGroups: { '18-35': 45, '36-55': 40, '55+': 15 }
    },
    products: ['Fashion', 'Electronics', 'Groceries', 'Services'],
    demandScore: 7.8,
    growthRate: 8.9,
    competition: 'Medium'
  },
  {
    id: '3',
    name: 'Kano Kurmi Market',
    location: {
      lat: 12.0022,
      lng: 8.5919,
      address: 'Kurmi Market, Kano'
    },
    demographics: {
      population: 35000,
      averageIncome: 25000,
      ageGroups: { '18-35': 70, '36-55': 20, '55+': 10 }
    },
    products: ['Textiles', 'Food', 'Spices', 'Traditional Items'],
    demandScore: 9.2,
    growthRate: 15.3,
    competition: 'High'
  },
  {
    id: '4',
    name: 'Port Harcourt Oil Mill Market',
    location: {
      lat: 4.8156,
      lng: 7.0498,
      address: 'Oil Mill Area, Port Harcourt'
    },
    demographics: {
      population: 12000,
      averageIncome: 55000,
      ageGroups: { '18-35': 55, '36-55': 35, '55+': 10 }
    },
    products: ['Oil Services', 'Construction', 'Food', 'Electronics'],
    demandScore: 6.9,
    growthRate: 6.7,
    competition: 'Medium'
  }
];

export const mockLogisticsRoutes: LogisticsRoute[] = [
  {
    id: '1',
    origin: 'Lagos',
    destination: 'Abuja',
    distance: 800,
    duration: '8-10 hours',
    costRange: { min: 15000, max: 25000 },
    providers: [
      {
        id: 'p1',
        name: 'ABC Logistics',
        cost: 18000,
        duration: '9 hours',
        rating: 4.2,
        reliability: 85,
        contact: '+234-123-4567'
      },
      {
        id: 'p2',
        name: 'XYZ Transport',
        cost: 22000,
        duration: '8.5 hours',
        rating: 4.5,
        reliability: 92,
        contact: '+234-987-6543'
      }
    ]
  },
  {
    id: '2',
    origin: 'Lagos',
    destination: 'Kano',
    distance: 1200,
    duration: '14-16 hours',
    costRange: { min: 25000, max: 35000 },
    providers: [
      {
        id: 'p3',
        name: 'Northern Express',
        cost: 28000,
        duration: '15 hours',
        rating: 4.0,
        reliability: 78,
        contact: '+234-555-1234'
      }
    ]
  },
  {
    id: '3',
    origin: 'Abuja',
    destination: 'Port Harcourt',
    distance: 600,
    duration: '6-8 hours',
    costRange: { min: 12000, max: 18000 },
    providers: [
      {
        id: 'p4',
        name: 'Delta Carriers',
        cost: 15000,
        duration: '7 hours',
        rating: 4.3,
        reliability: 88,
        contact: '+234-777-8888'
      }
    ]
  }
];

export const mockResearchReports: ResearchReport[] = [
  {
    id: '1',
    title: 'E-commerce Growth in Nigerian Markets 2024',
    category: 'Market Trends',
    summary: 'Analysis of e-commerce adoption and growth patterns across major Nigerian cities, with focus on consumer behavior and market opportunities.',
    keyFindings: [
      'E-commerce penetration reached 35% in urban areas',
      'Mobile commerce accounts for 70% of all e-commerce transactions',
      'Fashion and electronics are the top-selling categories',
      'Logistics challenges remain the biggest barrier to growth'
    ],
    date: '2024-11-01',
    author: 'Market Research Team',
    tags: ['e-commerce', 'digital transformation', 'consumer behavior']
  },
  {
    id: '2',
    title: 'Impact of Economic Policies on Small Business Growth',
    category: 'Economic Analysis',
    summary: 'Comprehensive study on how recent economic policies have affected small business operations and growth potential in Nigeria.',
    keyFindings: [
      'FX policy changes increased import costs by 25%',
      'MSMEs in tech sector showed 40% growth despite challenges',
      'Access to credit remains a critical bottleneck',
      'Digital adoption accelerated by necessity'
    ],
    date: '2024-10-15',
    author: 'Economic Research Division',
    tags: ['economic policy', 'small business', 'growth analysis']
  },
  {
    id: '3',
    title: 'Consumer Spending Patterns in Post-COVID Nigeria',
    category: 'Consumer Behavior',
    summary: 'Detailed analysis of changing consumer spending habits and preferences following the COVID-19 pandemic.',
    keyFindings: [
      'Health and wellness products saw 150% increase',
      'Online grocery shopping adoption rose by 300%',
      'Middle-income consumers shifted towards value-driven purchases',
      'Digital payment methods increased by 180%'
    ],
    date: '2024-09-20',
    author: 'Consumer Insights Team',
    tags: ['consumer behavior', 'spending patterns', 'post-covid']
  }
];