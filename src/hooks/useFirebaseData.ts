import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Market,
  LogisticsRoute,
  ResearchReport,
  mockMarkets,
  mockLogisticsRoutes,
  mockResearchReports
} from '@/data/mockData';

// Environment-based data source switching
const USE_MOCK_DATA = true; // Force mock data for development until Firebase is properly configured

export const useMarkets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Use mock data for development
      setMarkets(mockMarkets);
      setLoading(false);
      return;
    }

    // Real Firebase implementation
    const unsubscribe = onSnapshot(
      query(collection(db, 'markets'), orderBy('demandScore', 'desc')),
      (snapshot) => {
        const marketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Market));
        setMarkets(marketsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching markets:', err);
        setError('Failed to load market data');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { markets, loading, error };
};

export const useLogisticsRoutes = (origin?: string, destination?: string) => {
  const [routes, setRoutes] = useState<LogisticsRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      let filteredRoutes = mockLogisticsRoutes;

      if (origin) {
        filteredRoutes = filteredRoutes.filter(route =>
          route.origin.toLowerCase().includes(origin.toLowerCase())
        );
      }

      if (destination) {
        filteredRoutes = filteredRoutes.filter(route =>
          route.destination.toLowerCase().includes(destination.toLowerCase())
        );
      }

      setRoutes(filteredRoutes);
      setLoading(false);
      return;
    }

    // Real Firebase implementation
    let q = query(collection(db, 'logistics'), orderBy('distance'));

    if (origin || destination) {
      const conditions = [];
      if (origin) conditions.push(where('origin', '==', origin));
      if (destination) conditions.push(where('destination', '==', destination));
      q = query(collection(db, 'logistics'), ...conditions);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const routesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LogisticsRoute));
        setRoutes(routesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching logistics routes:', err);
        setError('Failed to load logistics data');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [origin, destination]);

  return { routes, loading, error };
};

export const useResearchReports = (category?: string, limitCount?: number) => {
  const [reports, setReports] = useState<ResearchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      let filteredReports = mockResearchReports;

      if (category) {
        filteredReports = filteredReports.filter(report =>
          report.category === category
        );
      }

      if (limitCount) {
        filteredReports = filteredReports.slice(0, limitCount);
      }

      setReports(filteredReports);
      setLoading(false);
      return;
    }

    // Real Firebase implementation
    let q = query(
      collection(db, 'research'),
      orderBy('date', 'desc')
    );

    if (category) {
      q = query(
        collection(db, 'research'),
        where('category', '==', category),
        orderBy('date', 'desc')
      );
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ResearchReport));
        setReports(reportsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching research reports:', err);
        setError('Failed to load research data');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [category, limitCount]);

  return { reports, loading, error };
};

// Utility hook for fetching single market by ID
export const useMarket = (marketId: string) => {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      const foundMarket = mockMarkets.find(m => m.id === marketId);
      setMarket(foundMarket || null);
      setLoading(false);
      return;
    }

    // Real Firebase implementation would go here
    // For now, return null as this is primarily for mock data
    setMarket(null);
    setLoading(false);
  }, [marketId]);

  return { market, loading, error };
};

// Hook for market analysis data
export const useMarketAnalysis = () => {
  const { markets, loading, error } = useMarkets();

  const analysis = {
    totalMarkets: markets.length,
    averageDemandScore: markets.length > 0
      ? markets.reduce((sum, market) => sum + market.demandScore, 0) / markets.length
      : 0,
    topPerformingMarkets: markets
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 5),
    growthRateAverage: markets.length > 0
      ? markets.reduce((sum, market) => sum + market.growthRate, 0) / markets.length
      : 0,
    marketDistribution: {
      highCompetition: markets.filter(m => m.competition === 'High').length,
      mediumCompetition: markets.filter(m => m.competition === 'Medium').length,
      lowCompetition: markets.filter(m => m.competition === 'Low').length,
    }
  };

  return { analysis, loading, error };
};