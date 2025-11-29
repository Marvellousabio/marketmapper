import { useState, useEffect, useCallback } from 'react';
import { Market, LogisticsRoute, ResearchReport, mockMarkets, mockLogisticsRoutes, mockResearchReports } from '@/data/mockData';

export function useRealtimeData() {
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [routes, setRoutes] = useState<LogisticsRoute[]>(mockLogisticsRoutes);
  const [reports, setReports] = useState<ResearchReport[]>(mockResearchReports);

  // Simulate real-time updates to market demand scores
  const updateMarketData = useCallback(() => {
    setMarkets(currentMarkets =>
      currentMarkets.map(market => ({
        ...market,
        demandScore: Math.max(1, Math.min(10, market.demandScore + (Math.random() - 0.5) * 2)), // Random change between -1 and +1
        growthRate: Math.max(0, Math.min(20, market.growthRate + (Math.random() - 0.5) * 4)) // Random change between -2 and +2
      }))
    );
  }, []);

  // Simulate adding new research reports occasionally
  const addNewReport = useCallback(() => {
    if (Math.random() < 0.1) { // 10% chance every update
      const newReport: ResearchReport = {
        id: `new-${Date.now()}`,
        title: `Latest Market Insights ${new Date().toLocaleDateString()}`,
        category: 'Market Trends',
        summary: 'Automated real-time market analysis update.',
        keyFindings: [
          'Demand patterns showing seasonal variations',
          'New competitor entries in key segments',
          'Technology adoption accelerating growth'
        ],
        date: new Date().toISOString().split('T')[0],
        author: 'Real-time Analytics System',
        tags: ['real-time', 'automation', 'market trends']
      };
      setReports(currentReports => [newReport, ...currentReports]);
    }
  }, []);

  // Simulate logistics route updates
  const updateLogisticsData = useCallback(() => {
    setRoutes(currentRoutes =>
      currentRoutes.map(route => ({
        ...route,
        providers: route.providers.map(provider => ({
          ...provider,
          rating: Math.max(1, Math.min(5, provider.rating + (Math.random() - 0.5) * 0.5)), // Small rating changes
          reliability: Math.max(50, Math.min(100, provider.reliability + (Math.random() - 0.5) * 10)) // Reliability changes
        }))
      }))
    );
  }, []);

  useEffect(() => {
    // Update data every 5-10 seconds to simulate real-time changes
    const interval = setInterval(() => {
      updateMarketData();
      updateLogisticsData();
      addNewReport();
    }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds

    return () => clearInterval(interval);
  }, [updateMarketData, updateLogisticsData, addNewReport]);

  return {
    markets,
    routes,
    reports,
    // Methods to manually trigger updates (for testing)
    triggerMarketUpdate: updateMarketData,
    triggerLogisticsUpdate: updateLogisticsData,
    triggerReportUpdate: addNewReport
  };
}