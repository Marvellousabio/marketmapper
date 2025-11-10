'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LogisticsPlan } from '@/types';
import { useLogisticsRoutes } from '@/hooks/useFirebaseData';

export default function LogisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState<Omit<LogisticsPlan, 'id' | 'userId'> | null>(null);

  // Fetch available logistics routes
  const { routes: availableRoutes, loading: routesLoading, error: routesError } = useLogisticsRoutes();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const generateLogisticsPlan = () => {
    if (!location.trim() || !destination.trim()) return;

    setPlanning(true);

    // Simulate AI logistics planning
    setTimeout(async () => {
      const planData = {
        location,
        transportationMethods: [
          {
            type: 'Motorcycle Courier',
            cost: 2500,
            reliability: 4.2,
            speed: '30-45 mins'
          },
          {
            type: 'Car Delivery',
            cost: 4500,
            reliability: 4.5,
            speed: '45-60 mins'
          },
          {
            type: 'Van Service',
            cost: 7500,
            reliability: 4.7,
            speed: '60-90 mins'
          }
        ],
        routes: [
          {
            from: location,
            to: destination,
            distance: 12.5,
            estimatedTime: '35 minutes',
            trafficConditions: 'Moderate traffic expected'
          }
        ],
        partners: [
          {
            name: 'Bolt Logistics Lagos',
            type: 'Delivery Service',
            contact: '+234 801 234 5678',
            coverage: 'Lagos Metro',
            rating: 4.3
          },
          {
            name: 'Max.ng',
            type: 'Courier Service',
            contact: '+234 802 345 6789',
            coverage: 'Lagos & Abuja',
            rating: 4.1
          },
          {
            name: 'Local Riders Co-op',
            type: 'Motorcycle Network',
            contact: '+234 803 456 7890',
            coverage: 'Local deliveries',
            rating: 4.5
          }
        ],
        estimatedDeliveryTime: '45 minutes',
        totalCost: 2500
      };

      try {
        // Save logistics plan to Firestore
        await addDoc(collection(db, 'logisticsPlans'), {
          userId: user!.id,
          ...planData,
          createdAt: serverTimestamp()
        });

        setPlan(planData);
      } catch (error) {
        console.error('Error saving logistics plan:', error);
      } finally {
        setPlanning(false);
      }
    }, 2500);
  };

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Logistics Planning</h1>
        <p className="mt-2 text-gray-600">
          Optimize your delivery routes and choose the best transportation methods
        </p>
      </div>

      {/* Available Routes Overview */}
      {!routesLoading && !routesError && availableRoutes.length > 0 && (
        <div className="mb-8">
          <Card title="Available Routes" description="Popular logistics routes in our database">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRoutes.slice(0, 6).map((route) => (
                <div key={route.id} className="p-4 border rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{route.origin} → {route.destination}</h4>
                    <span className="text-sm text-gray-500">{route.distance}km</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{route.duration}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span>₦{route.costRange.min.toLocaleString()} - ₦{route.costRange.max.toLocaleString()}</span>
                    <span className="text-green-600">{route.providers.length} providers</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {!plan ? (
        <Card title="Plan Your Logistics" description="Enter your delivery details">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pickup Location"
                placeholder="e.g., Surulere, Lagos"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              <Input
                label="Delivery Destination"
                placeholder="e.g., Victoria Island, Lagos"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What we&apos;ll optimize:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Best transportation methods for your route</li>
                <li>• Cost-effective delivery options</li>
                <li>• Reliable local partners and couriers</li>
                <li>• Estimated delivery times and traffic conditions</li>
              </ul>
            </div>

            <Button
              onClick={generateLogisticsPlan}
              disabled={planning || !location.trim() || !destination.trim()}
              className="w-full"
            >
              {planning ? 'Planning Route...' : 'Generate Logistics Plan'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Logistics Plan: {location} → {destination}
            </h2>
            <Button variant="outline" onClick={() => setPlan(null)}>
              New Plan
            </Button>
          </div>

          {/* Transportation Methods */}
          <Card title="Recommended Transportation Methods" description="Choose the best option for your delivery">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.transportationMethods.map((method, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{method.type}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{method.reliability}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>💰 ₦{method.cost.toLocaleString()}</p>
                    <p>⚡ {method.speed}</p>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Select This Option
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Route Details */}
          <Card title="Route Details" description="Optimized delivery route information">
            <div className="space-y-4">
              {plan.routes.map((route, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Distance:</span>
                      <p className="text-lg font-semibold text-gray-900">{route.distance} km</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Est. Time:</span>
                      <p className="text-lg font-semibold text-green-600">{route.estimatedTime}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Traffic:</span>
                      <p className="text-sm text-gray-600">{route.trafficConditions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Logistics Partners */}
          <Card title="Recommended Partners" description="Trusted local delivery services">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.partners.map((partner, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{partner.name}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{partner.rating}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>🏷️ {partner.type}</p>
                    <p>📞 {partner.contact}</p>
                    <p>📍 {partner.coverage}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Contact Partner
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card title="Delivery Summary" description="Complete logistics overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery Time:</span>
                  <span className="font-semibold text-green-600">{plan.estimatedDeliveryTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-semibold text-gray-900">₦{plan.totalCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Button size="lg">
                  Confirm & Book Delivery
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}