'use client';

import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import { Sun, Moon, Monitor } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 px-3 py-2 border-none outline-none"
          title={`Current theme: ${currentTheme.label}. Click to select theme.`}
        >
          <span className="text-lg">
            <currentTheme.icon />
          </span>
          <span className="hidden sm:inline text-sm">{currentTheme.label}</span>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          align="end"
        >
          {themes.map(({ value, label, icon: Icon }) => (
            <DropdownMenu.Item
              key={value}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto h-4 w-4">✓</span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};