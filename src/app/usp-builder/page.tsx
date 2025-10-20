'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface USPData {
  product: string;
  uniqueFeatures: string[];
  targetAudience: string;
  competitiveAdvantage: string;
  valueProposition: string;
}

export default function USPBuilderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uspData, setUspData] = useState<USPData>({
    product: '',
    uniqueFeatures: [''],
    targetAudience: '',
    competitiveAdvantage: '',
    valueProposition: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedUSP, setGeneratedUSP] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const addFeature = () => {
    setUspData(prev => ({
      ...prev,
      uniqueFeatures: [...prev.uniqueFeatures, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setUspData(prev => ({
      ...prev,
      uniqueFeatures: prev.uniqueFeatures.map((feature, i) =>
        i === index ? value : feature
      )
    }));
  };

  const removeFeature = (index: number) => {
    if (uspData.uniqueFeatures.length > 1) {
      setUspData(prev => ({
        ...prev,
        uniqueFeatures: prev.uniqueFeatures.filter((_, i) => i !== index)
      }));
    }
  };

  const generateUSP = () => {
    const usp = `For ${uspData.targetAudience}, ${uspData.product} delivers ${uspData.valueProposition} through ${uspData.uniqueFeatures.filter(f => f.trim()).join(', ')}. Unlike competitors, we ${uspData.competitiveAdvantage}.`;
    setGeneratedUSP(usp);
    setCurrentStep(6);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return uspData.product.trim().length > 0;
      case 2: return uspData.uniqueFeatures.some(f => f.trim().length > 0);
      case 3: return uspData.targetAudience.trim().length > 0;
      case 4: return uspData.competitiveAdvantage.trim().length > 0;
      case 5: return uspData.valueProposition.trim().length > 0;
      default: return false;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">USP Builder</h1>
        <p className="mt-2 text-gray-600">
          Craft a compelling Unique Selling Proposition for your business
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Product</span>
          <span>Features</span>
          <span>Audience</span>
          <span>Advantage</span>
          <span>Value</span>
        </div>
      </div>

      <Card>
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">What product or service are you offering?</h2>
              <p className="text-gray-600 mb-4">Be specific about what you&apos;re selling.</p>
              <Input
                placeholder="e.g., Healthy ready-to-eat meals, Local handicrafts, Organic produce delivery"
                value={uspData.product}
                onChange={(e) => setUspData(prev => ({ ...prev, product: e.target.value }))}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">What makes your offering unique?</h2>
              <p className="text-gray-600 mb-4">List the special features or qualities that set you apart.</p>
              <div className="space-y-3">
                {uspData.uniqueFeatures.map((feature, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder={`Unique feature ${index + 1}`}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1"
                    />
                    {uspData.uniqueFeatures.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="px-3"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addFeature} size="sm">
                  + Add Another Feature
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Who is your target audience?</h2>
              <p className="text-gray-600 mb-4">Describe your ideal customers.</p>
              <Input
                placeholder="e.g., Busy professionals aged 25-45, Health-conscious families, Young entrepreneurs"
                value={uspData.targetAudience}
                onChange={(e) => setUspData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">What is your competitive advantage?</h2>
              <p className="text-gray-600 mb-4">How do you do things differently or better than competitors?</p>
              <Input
                placeholder="e.g., Use only locally sourced organic ingredients, Offer same-day delivery, Provide personalized meal planning"
                value={uspData.competitiveAdvantage}
                onChange={(e) => setUspData(prev => ({ ...prev, competitiveAdvantage: e.target.value }))}
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">What value do you provide?</h2>
              <p className="text-gray-600 mb-4">What specific benefit or outcome do customers get?</p>
              <Input
                placeholder="e.g., Nutritious, convenient meals that save time, Authentic cultural experiences, Fresh, chemical-free produce"
                value={uspData.valueProposition}
                onChange={(e) => setUspData(prev => ({ ...prev, valueProposition: e.target.value }))}
              />
            </div>
          </div>
        )}

        {currentStep === 6 && generatedUSP && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Unique Selling Proposition</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-lg text-gray-800 leading-relaxed">{generatedUSP}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Using Your USP:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use it in all your marketing materials</li>
                <li>• Train your staff to communicate it consistently</li>
                <li>• Include it in your business plan and pitch</li>
                <li>• Test it with potential customers for feedback</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentStep < 5 && (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
              </Button>
            )}

            {currentStep === 5 && (
              <Button
                onClick={generateUSP}
                disabled={!canProceed()}
              >
                Generate USP
              </Button>
            )}

            {currentStep === 6 && (
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Create Another
                </Button>
                <Button onClick={() => router.push('/logistics')}>
                  Plan Logistics
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}