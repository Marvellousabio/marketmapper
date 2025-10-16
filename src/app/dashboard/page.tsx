'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.displayName || 'Entrepreneur'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to discover your next business opportunity?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Market Analysis" description="Analyze demand in your area">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Get AI-powered insights into local market trends, demographics, and demand patterns.
            </p>
            <Link href="/analysis">
              <Button className="w-full">
                Start Analysis
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Product Recommendations" description="Find profitable products">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Discover high-demand products with supplier information and profit estimates.
            </p>
            <Link href="/recommendations">
              <Button variant="outline" className="w-full">
                View Recommendations
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Build Your USP" description="Create unique selling points">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Develop compelling value propositions that set your business apart.
            </p>
            <Link href="/usp-builder">
              <Button variant="outline" className="w-full">
                Build USP
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Logistics Planning" description="Optimize delivery routes">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Plan efficient delivery strategies with local partners and cost analysis.
            </p>
            <Link href="/logistics">
              <Button variant="outline" className="w-full">
                Plan Logistics
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Market Research" description="Conduct customer surveys">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Create and manage surveys, focus groups, and customer interviews.
            </p>
            <Link href="/research">
              <Button variant="outline" className="w-full">
                Start Research
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Business Profile" description="Manage your information">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Update your business details, location, and preferences.
            </p>
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Market Analyses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Products Explored</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Surveys Created</div>
          </div>
        </div>
      </div>
    </div>
  );
}