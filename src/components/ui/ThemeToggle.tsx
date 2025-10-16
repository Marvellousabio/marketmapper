'use client';

import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import {Sun,Moon,System} from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <DesktopIcon />; // System/Monitor icon
    } else if (resolvedTheme === 'dark') {
      return <Moon />; // Moon icon for dark
    } else {
      return <Sun />; // Sun icon for light
    }
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System';
    } else if (theme === 'dark') {
      return 'Dark';
    } else {
      return 'Light';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 border-none outline-none"
      title={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="hidden sm:inline text-sm">{getLabel()}</span>
    </Button>
  );
};