'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { createRecommendationEngine } from '@/lib/recommendationEngine';
import { MarketRecommendation, LogisticsRecommendation, ResearchRecommendation } from '@/types';

export default function RecommendationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { markets, routes, reports } = useRealtimeData();
  const [marketRecommendations, setMarketRecommendations] = useState<MarketRecommendation[]>([]);
  const [logisticsRecommendations, setLogisticsRecommendations] = useState<LogisticsRecommendation[]>([]);
  const [researchRecommendations, setResearchRecommendations] = useState<ResearchRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [engine, setEngine] = useState(createRecommendationEngine(markets, routes, reports));

  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    minDemandScore: 0,
    maxCompetition: 'High' as 'Low' | 'Medium' | 'High',
    products: [] as string[],
    budgetRange: { min: 0, max: 100000 },
    riskTolerance: 'medium' as 'low' | 'medium' | 'high'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Update engine when data changes
  useEffect(() => {
    setEngine(createRecommendationEngine(markets, routes, reports));
  }, [markets, routes, reports]);

  const recordInteraction = (itemType: 'market' | 'logistics' | 'research', itemId: string, interactionType: 'view' | 'save' | 'contact' | 'analyze') => {
    if (user) {
      engine.recordUserInteraction(user.id, itemType, itemId, interactionType);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const generateRecommendations = async () => {
    if (!user) return;

    setLoadingRecs(true);

    try {
      const engine = createRecommendationEngine(markets, routes, reports);

      // Generate rule-based recommendations with filters
      const marketRecs = engine.recommendMarkets({
        minDemandScore: filters.minDemandScore || 7,
        products: filters.products.length > 0 ? filters.products : undefined,
        maxCompetition: filters.maxCompetition,
        location: filters.location ? {
          lat: 6.5244, lng: 3.3792, radius: 500 // Default to Lagos area, would be dynamic in real app
        } : undefined
      });

      const logisticsRecs = engine.recommendLogistics('Lagos', 'Abuja');

      const researchRecs = engine.recommendResearchReports({
        category: 'Market Trends',
        tags: ['e-commerce', 'digital transformation']
      });

      // Generate risk-adjusted collaborative filtering recommendations
      const collabRecs = engine.getRiskAdjustedRecommendations(user.id, filters.riskTolerance);

      // Combine and deduplicate recommendations
      const combinedMarketRecs = [...marketRecs, ...collabRecs.marketRecommendations]
        .filter((rec, index, self) =>
          index === self.findIndex(r => r.market.id === rec.market.id)
        )
        .sort((a, b) => b.score - a.score);

      const combinedLogisticsRecs = [...logisticsRecs, ...collabRecs.logisticsRecommendations]
        .filter((rec, index, self) =>
          index === self.findIndex(r => r.route.id === rec.route.id)
        )
        .sort((a, b) => b.score - a.score);

      const combinedResearchRecs = [...researchRecs, ...collabRecs.researchRecommendations]
        .filter((rec, index, self) =>
          index === self.findIndex(r => r.report.id === rec.report.id)
        )
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      setMarketRecommendations(combinedMarketRecs);
      setLogisticsRecommendations(combinedLogisticsRecs);
      setResearchRecommendations(combinedResearchRecs);

      // Save to Firestore for persistence (optional)
      try {
        await addDoc(collection(db, 'recommendationSessions'), {
          userId: user.id,
          marketRecommendations: combinedMarketRecs,
          logisticsRecommendations: combinedLogisticsRecs,
          researchRecommendations: combinedResearchRecs,
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Continue without saving
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Recommendations</h1>
        <p className="mt-2 text-gray-600">
          AI-powered suggestions for high-demand products with supplier information
        </p>
      </div>

      {!marketRecommendations.length && !logisticsRecommendations.length && !researchRecommendations.length ? (
        <Card title="Generate Real-Time Recommendations" description="Get AI-powered market, logistics, and research insights">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Discover Real-Time Market Opportunities
              </h3>
              <p className="text-gray-600 mb-6">
                Our real-time recommendation engine analyzes live market data, logistics routes, and research reports to provide instant insights.
              </p>
            </div>

            <Button
              onClick={generateRecommendations}
              disabled={loadingRecs}
              size="lg"
            >
              {loadingRecs ? 'Analyzing Data...' : 'Generate Real-Time Recommendations'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Recommendations</h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button variant="outline" onClick={generateRecommendations}>
                Refresh Analysis
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card title="Filter Recommendations" description="Customize your recommendations">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                   title="location"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Locations</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Kano">Kano</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Demand Score</label>
                  <input
                  title="form-range"
                    type="range"
                    min="0"
                    max="10"
                    value={filters.minDemandScore}
                    onChange={(e) => setFilters({...filters, minDemandScore: Number(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{filters.minDemandScore}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Competition</label>
                  <select
                  title="competition"
                    value={filters.maxCompetition}
                    onChange={(e) => setFilters({...filters, maxCompetition: e.target.value as 'Low' | 'Medium' | 'High'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                  <select
                  title='risk'
                    value={filters.riskTolerance}
                    onChange={(e) => setFilters({...filters, riskTolerance: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {['Electronics', 'Fashion', 'Food', 'Textiles', 'Oil Services', 'Construction'].map(product => (
                      <label key={product} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={filters.products.includes(product)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, products: [...filters.products, product]});
                            } else {
                              setFilters({...filters, products: filters.products.filter(p => p !== product)});
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">{product}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    location: '',
                    minDemandScore: 0,
                    maxCompetition: 'High',
                    products: [],
                    budgetRange: { min: 0, max: 100000 },
                    riskTolerance: 'medium'
                  })}
                >
                  Reset Filters
                </Button>
                <Button onClick={() => { setShowFilters(false); generateRecommendations(); }}>
                  Apply Filters
                </Button>
              </div>
            </Card>
          )}

          {/* Market Recommendations */}
          {marketRecommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Recommended Markets</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {marketRecommendations.slice(0, 4).map((rec, index) => (
                  <Card key={index} title={rec.market.name} description={rec.market.location.address}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Demand Score</span>
                        <span className="text-lg font-bold text-green-600">{rec.market.demandScore}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Growth Rate</span>
                        <span className="text-lg font-bold text-blue-600">{rec.market.growthRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Competition</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.market.competition === 'Low' ? 'text-green-600 bg-green-100' : rec.market.competition === 'Medium' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'}`}>
                          {rec.market.competition}
                        </span>
                      </div>

                      {/* Risk Assessment */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Risk Level</span>
                        {(() => {
                          const risk = engine.getMarketRiskAssessment(rec.market);
                          const riskColor = risk.riskLevel === 'low' ? 'text-green-600 bg-green-100' :
                                           risk.riskLevel === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                                           risk.riskLevel === 'high' ? 'text-orange-600 bg-orange-100' :
                                           'text-red-600 bg-red-100';
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                              {risk.riskLevel.toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-sm text-gray-600">{rec.reason}</p>
                      {rec.relatedReports.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Related Research:</span>
                          <p className="text-sm text-gray-600">{rec.relatedReports[0].title}</p>
                        </div>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => recordInteraction('market', rec.market.id, 'view')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => recordInteraction('market', rec.market.id, 'save')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          💾 Save
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Logistics Recommendations */}
          {logisticsRecommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚚 Logistics Recommendations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {logisticsRecommendations.map((rec, index) => (
                  <Card key={index} title={`${rec.route.origin} → ${rec.route.destination}`} description={`Distance: ${rec.route.distance}km`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Best Provider</span>
                        <span className="font-semibold text-green-600">{rec.bestProvider.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Rating</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-bold">{rec.bestProvider.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Reliability</span>
                        <span className="font-bold text-blue-600">{rec.bestProvider.reliability}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Cost</span>
                        <span className="font-bold">₦{rec.bestProvider.cost.toLocaleString()}</span>
                      </div>

                      {/* Risk Assessment */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Risk Level</span>
                        {(() => {
                          const risk = engine.getLogisticsRiskAssessment(rec.route, rec.bestProvider);
                          const riskColor = risk.riskLevel === 'low' ? 'text-green-600 bg-green-100' :
                                           risk.riskLevel === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                                           risk.riskLevel === 'high' ? 'text-orange-600 bg-orange-100' :
                                           'text-red-600 bg-red-100';
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                              {risk.riskLevel.toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>

                      <p className="text-sm text-gray-600">{rec.reason}</p>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => recordInteraction('logistics', rec.route.id, 'view')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => recordInteraction('logistics', rec.route.id, 'analyze')}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          📊 Analyze
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Research Recommendations */}
          {researchRecommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Research Insights</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {researchRecommendations.slice(0, 3).map((rec, index) => (
                  <Card key={index} title={rec.report.title} description={rec.report.category}>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{rec.report.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Relevance Score</span>
                        <span className="font-bold text-green-600">{rec.relevanceScore.toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Key Findings:</span>
                        <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                          {rec.report.keyFindings.slice(0, 2).map((finding, i) => (
                            <li key={i}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                      {rec.matchingTags.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Matching Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.matchingTags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => recordInteraction('research', rec.report.id, 'view')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => recordInteraction('research', rec.report.id, 'save')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          💾 Save
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Recommendations update in real-time as market data changes. Data refreshes every 5-10 seconds.
            </p>
            <Button variant="outline" onClick={() => router.push('/analysis')}>
              View Detailed Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
