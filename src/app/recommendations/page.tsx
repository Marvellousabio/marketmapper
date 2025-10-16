'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProductRecommendation {
  id: string;
  product: string;
  category: string;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  suppliers: Array<{
    name: string;
    location: string;
    contact: string;
    priceRange: string;
    reliability: number;
  }>;
  estimatedProfit: number;
  targetAudience: string;
}

export default function RecommendationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const generateRecommendations = () => {
    setLoadingRecs(true);

    // Simulate AI-generated recommendations based on market analysis
    setTimeout(() => {
      setRecommendations([
        {
          id: '1',
          product: 'Healthy Ready-to-Eat Meals',
          category: 'Food & Beverage',
          demandScore: 85,
          competitionLevel: 'medium',
          suppliers: [
            {
              name: 'Lagos Fresh Foods Ltd',
              location: 'Surulere, Lagos',
              contact: '+234 801 234 5678',
              priceRange: '₦2,500 - ₦4,500',
              reliability: 4.2
            },
            {
              name: 'Organic Farms Nigeria',
              location: 'Ikeja, Lagos',
              contact: '+234 802 345 6789',
              priceRange: '₦3,000 - ₦5,000',
              reliability: 4.5
            }
          ],
          estimatedProfit: 45000,
          targetAudience: 'Busy professionals aged 25-45'
        },
        {
          id: '2',
          product: 'Local Handicrafts & Artisanal Goods',
          category: 'Arts & Crafts',
          demandScore: 78,
          competitionLevel: 'low',
          suppliers: [
            {
              name: 'Nigerian Artisans Cooperative',
              location: 'Victoria Island, Lagos',
              contact: '+234 803 456 7890',
              priceRange: '₦5,000 - ₦25,000',
              reliability: 4.7
            }
          ],
          estimatedProfit: 65000,
          targetAudience: 'Middle-income families and tourists'
        },
        {
          id: '3',
          product: 'Organic Produce Delivery',
          category: 'Agriculture',
          demandScore: 92,
          competitionLevel: 'low',
          suppliers: [
            {
              name: 'Green Farms Lagos',
              location: 'Agege, Lagos',
              contact: '+234 804 567 8901',
              priceRange: '₦1,500 - ₦3,000',
              reliability: 4.3
            },
            {
              name: 'Urban Gardens Ltd',
              location: 'Ikorodu, Lagos',
              contact: '+234 805 678 9012',
              priceRange: '₦2,000 - ₦3,500',
              reliability: 4.1
            }
          ],
          estimatedProfit: 38000,
          targetAudience: 'Health-conscious families'
        }
      ]);
      setLoadingRecs(false);
    }, 2000);
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

      {!recommendations.length ? (
        <Card title="Generate Recommendations" description="Get personalized product suggestions">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to discover profitable opportunities?
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI analyzes market data to recommend products with high demand and low competition in your area.
              </p>
            </div>

            <Button
              onClick={generateRecommendations}
              disabled={loadingRecs}
              size="lg"
            >
              {loadingRecs ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Recommended Products</h2>
            <Button variant="outline" onClick={generateRecommendations}>
              Refresh Recommendations
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.id} title={rec.product} description={rec.category}>
                <div className="space-y-4">
                  {/* Demand Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Demand Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${rec.demandScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{rec.demandScore}%</span>
                    </div>
                  </div>

                  {/* Competition Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Competition</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(rec.competitionLevel)}`}>
                      {rec.competitionLevel.toUpperCase()}
                    </span>
                  </div>

                  {/* Estimated Profit */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Est. Monthly Profit</span>
                    <span className="text-lg font-bold text-green-600">
                      ₦{rec.estimatedProfit.toLocaleString()}
                    </span>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Target Audience:</span>
                    <p className="text-sm text-gray-600 mt-1">{rec.targetAudience}</p>
                  </div>

                  {/* Suppliers */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Suppliers</h4>
                    <div className="space-y-3">
                      {rec.suppliers.map((supplier, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{supplier.name}</h5>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-gray-600">{supplier.reliability}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📍 {supplier.location}</p>
                            <p>📞 {supplier.contact}</p>
                            <p>💰 {supplier.priceRange}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button size="sm" className="flex-1">
                      Build USP
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Plan Logistics
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Want more specific recommendations? Complete a market analysis first.
            </p>
            <Button variant="outline" onClick={() => router.push('/analysis')}>
              Start Market Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}