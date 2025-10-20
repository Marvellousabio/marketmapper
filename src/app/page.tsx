import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Local Demand & Logistics Advisor
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover profitable business opportunities in Nigeria with our intelligent market analysis,
              personalized product recommendations, and optimized logistics planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Business Journey
                </Button>
              </Link>
              <Link href="/analysis">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Market Analysis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Start Successfully
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From market research to logistics optimization, we provide comprehensive guidance
              tailored for Nigerian entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card title="Market Analysis" description="AI-powered demand analysis for your location">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Demographic insights</li>
                  <li>• Social media trends</li>
                  <li>• Competitor analysis</li>
                  <li>• Demand forecasting</li>
                </ul>
              </div>
            </Card>

            <Card title="Product Recommendations" description="Curated suggestions with suppliers">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• High-demand products</li>
                  <li>• Supplier connections</li>
                  <li>• Profit margin analysis</li>
                  <li>• Market gap identification</li>
                </ul>
              </div>
            </Card>

            <Card title="USP Builder" description="Craft your unique selling proposition">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Competitive advantage</li>
                  <li>• Brand positioning</li>
                  <li>• Value proposition</li>
                  <li>• Marketing messaging</li>
                </ul>
              </div>
            </Card>

            <Card title="Logistics Planning" description="Optimized delivery strategies">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Route optimization</li>
                  <li>• Local partners</li>
                  <li>• Cost analysis</li>
                  <li>• Delivery reliability</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business Idea?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of Nigerian entrepreneurs who have successfully launched their businesses
            with Market Mapper&apos;s guidance.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
