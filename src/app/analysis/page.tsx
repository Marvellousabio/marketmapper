'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function AnalysisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
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
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleAnalysis = async () => {
    if (!location.trim()) return;

    setAnalyzing(true);

    // Simulate AI analysis (in real implementation, this would call Firebase Functions)
    setTimeout(() => {
      setResults({
        demographics: {
          ageGroups: { '18-25': 25, '26-35': 35, '36-45': 25, '46+': 15 },
          incomeLevels: { 'Low': 40, 'Middle': 45, 'High': 15 },
          interests: ['Technology', 'Food', 'Fashion', 'Health']
        },
        trends: {
          socialMedia: ['Demand for healthy meals up 40%', 'Interest in local artisans growing'],
          searchTerms: ['healthy lunch Lagos', 'local crafts Surulere'],
          competitorActivity: ['3 new food vendors', '2 craft shops opened']
        },
        demandGaps: {
          highDemand: ['Healthy ready-to-eat meals', 'Local handicrafts', 'Delivery services'],
          lowCompetition: ['Organic produce delivery', 'Customized healthy meals'],
          emergingTrends: ['Plant-based foods', 'Sustainable products']
        }
      });
      setAnalyzing(false);
    }, 3000);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
        <p className="mt-2 text-gray-600">
          Discover demand patterns and opportunities in your target location
        </p>
      </div>

      {!results ? (
        <Card title="Start Your Analysis" description="Enter your target location to begin">
          <div className="space-y-6">
            <Input
              label="Location"
              placeholder="e.g., Surulere, Lagos"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What we'll analyze:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Local demographics and population data</li>
                <li>• Social media trends and conversations</li>
                <li>• Competitor landscape and market gaps</li>
                <li>• Search patterns and consumer interests</li>
              </ul>
            </div>

            <Button
              onClick={handleAnalysis}
              disabled={analyzing || !location.trim()}
              className="w-full"
            >
              {analyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Analysis Results for {location}</h2>
            <Button variant="outline" onClick={() => setResults(null)}>
              New Analysis
            </Button>
          </div>

          {/* Demographics */}
          <Card title="Demographics" description="Population breakdown in your area">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Age Groups</h4>
                <div className="space-y-2">
                  {Object.entries(results.demographics.ageGroups).map(([age, percentage]) => (
                    <div key={age} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{age} years</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Income Levels</h4>
                <div className="space-y-2">
                  {Object.entries(results.demographics.incomeLevels).map(([level, percentage]) => (
                    <div key={level} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{level}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Popular Interests</h4>
              <div className="flex flex-wrap gap-2">
                {results.demographics.interests.map((interest: string) => (
                  <span key={interest} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Trends */}
          <Card title="Market Trends" description="Current trends and competitor activity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Social Media Trends</h4>
                <ul className="space-y-2">
                  {results.trends.socialMedia.map((trend: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Search Terms</h4>
                <ul className="space-y-2">
                  {results.trends.searchTerms.map((term: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Competitor Activity</h4>
                <ul className="space-y-2">
                  {results.trends.competitorActivity.map((activity: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Demand Gaps */}
          <Card title="Demand Gaps & Opportunities" description="High-demand, low-competition opportunities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3">High Demand</h4>
                <ul className="space-y-2">
                  {results.demandGaps.highDemand.map((item: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-700 mb-3">Low Competition</h4>
                <ul className="space-y-2">
                  {results.demandGaps.lowCompetition.map((item: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-purple-700 mb-3">Emerging Trends</h4>
                <ul className="space-y-2">
                  {results.demandGaps.emergingTrends.map((item: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/recommendations')}>
              Get Product Recommendations
            </Button>
            <Button variant="outline" onClick={() => router.push('/research')}>
              Create Market Survey
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}