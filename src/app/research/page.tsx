'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MarketResearch, ResearchResponse } from '@/types';
import { useResearchReports } from '@/hooks/useFirebaseData';

export default function ResearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [researchType, setResearchType] = useState<'survey' | 'focus_group' | 'interview' | 'social_listening'>('survey');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [research, setResearch] = useState<MarketResearch | null>(null);
  const [creating, setCreating] = useState(false);

  // Fetch research reports
  const { reports: availableReports, loading: reportsLoading, error: reportsError } = useResearchReports();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const createResearch = async () => {
    if (!user) return;

    const validQuestions = questions.filter(q => q.trim().length > 0);
    if (validQuestions.length === 0) return;

    setCreating(true);

    try {
      // Create research data
      const researchData = {
        userId: user.id,
        type: researchType,
        questions: validQuestions,
        responses: [] as ResearchResponse[],
        insights: [] as string[],
        createdAt: serverTimestamp()
      };

      // Add mock responses based on research type
      if (researchType === 'survey') {
        researchData.responses = [
          {
            question: validQuestions[0],
            answer: 'Yes, definitely interested',
            respondentId: 'resp1',
            timestamp: new Date()
          },
          {
            question: validQuestions[0],
            answer: 'Maybe, depends on price',
            respondentId: 'resp2',
            timestamp: new Date()
          }
        ];
        researchData.insights = [
          '65% of respondents show interest in healthy meal delivery',
          'Price sensitivity is a key factor for 40% of potential customers',
          'Delivery time under 30 minutes is preferred by 80% of respondents'
        ];
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'marketResearch'), researchData);

      setResearch({
        id: docRef.id,
        ...researchData,
        createdAt: new Date() // Keep client-side date for display
      });
    } catch (error) {
      console.error('Error creating research:', error);
    } finally {
      setCreating(false);
    }
  };

  const researchTypes = [
    { value: 'survey', label: 'Online Survey', description: 'Collect responses from a large audience' },
    { value: 'focus_group', label: 'Focus Group', description: 'In-depth discussion with small groups' },
    { value: 'interview', label: 'Customer Interviews', description: 'One-on-one conversations' },
    { value: 'social_listening', label: 'Social Media Listening', description: 'Monitor online conversations' }
  ];

  if (authLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Market Research</h1>
        <p className="mt-2 text-gray-600">
          Create surveys, conduct interviews, and gather customer insights
        </p>
      </div>

      {/* Research Reports Overview */}
      {!reportsLoading && !reportsError && availableReports.length > 0 && (
        <div className="mb-8">
          <Card title="Latest Research Reports" description="Insights from our research database">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableReports.slice(0, 6).map((report) => (
                <div key={report.id} className="p-4 border rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{report.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {report.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.summary}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{report.author}</span>
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {!research ? (
        <Card title="Create Market Research" description="Choose your research method and design your questions">
          <div className="space-y-6">
            {/* Research Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Research Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      researchType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setResearchType(type.value as 'survey' | 'focus_group' | 'interview' | 'social_listening')}
                  >
                    <h4 className="font-medium text-gray-900">{type.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Questions
              </label>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder={`Question ${index + 1}`}
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      className="flex-1"
                    />
                    {questions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="px-3"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addQuestion} size="sm">
                  + Add Question
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Research Best Practices:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep questions clear and concise</li>
                <li>• Use a mix of open-ended and closed questions</li>
                <li>• Test your survey with a small group first</li>
                <li>• Offer incentives for participation</li>
              </ul>
            </div>

            <Button
              onClick={createResearch}
              disabled={creating || questions.filter(q => q.trim()).length === 0}
              className="w-full"
            >
              {creating ? 'Creating Research...' : 'Create & Launch Research'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {researchTypes.find(t => t.value === research.type)?.label} Results
            </h2>
            <Button variant="outline" onClick={() => setResearch(null)}>
              Create New Research
            </Button>
          </div>

          {/* Research Overview */}
          <Card title="Research Overview" description="Summary of your market research">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{research.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{research.responses.length}</div>
                <div className="text-sm text-gray-600">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{research.insights.length}</div>
                <div className="text-sm text-gray-600">Insights</div>
              </div>
            </div>
          </Card>

          {/* Questions & Responses */}
          <Card title="Questions & Responses" description="Survey questions and collected responses">
            <div className="space-y-6">
              {research.questions.map((question, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question}
                  </h4>
                  <div className="space-y-2">
                    {research.responses
                      .filter(r => r.question === question)
                      .map((response, respIndex) => (
                        <div key={respIndex} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-800">{response.answer}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Respondent {response.respondentId} • {response.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Insights */}
          <Card title="Key Insights" description="AI-generated insights from your research data">
            <div className="space-y-4">
              {research.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-800">{insight}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/analysis')}>
              Use for Market Analysis
            </Button>
            <Button variant="outline" onClick={() => router.push('/recommendations')}>
              Generate Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}