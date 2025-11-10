'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (navRef.current && containerRef.current) {
        const navWidth = navRef.current.scrollWidth;
        const containerWidth = containerRef.current.offsetWidth;
        const availableWidth = containerWidth - 200; // Account for logo and right-side elements
        setIsOverflowing(navWidth > availableWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className="flex justify-between items-center h-16">
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

          <nav ref={navRef} className={`${isOverflowing ? 'hidden' : 'hidden lg:flex'} space-x-8`}>
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
            {isOverflowing && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.displayName || user.email}</span>
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

        {isOverflowing && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <nav className="px-4 py-4 space-y-2">
              <Link
                href="/dashboard"
                className="block text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/analysis"
                className="block text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Market Analysis
              </Link>
              <Link
                href="/recommendations"
                className="block text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recommendations
              </Link>
              <Link
                href="/logistics"
                className="block text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Logistics
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};