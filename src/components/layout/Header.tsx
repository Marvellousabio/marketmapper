'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                resolvedTheme === 'dark' ? 'bg-green-500' : 'bg-green-600'
              }`}>
                <span className="text-white font-bold text-sm">MM</span>
              </div>
              <span className="text-xl font-bold text-foreground">Market Mapper</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/analysis" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Market Analysis
            </Link>
            <Link href="/recommendations" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Recommendations
            </Link>
            <Link href="/logistics" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Logistics
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{user.displayName || user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};