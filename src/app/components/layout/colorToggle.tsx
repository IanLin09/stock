'use client';

import { FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SidebarMenuButton } from '@/components/ui/sidebar';

const ColorThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <button className="w-6 h-6"></button>; // Render an empty button to prevent layout shift
  }

  if (resolvedTheme === 'dark') {
    return (
      <SidebarMenuButton onClick={() => setTheme('light')}>
        <FiSun />
        <span>Light Mode </span>
      </SidebarMenuButton>
    );
  }

  if (resolvedTheme === 'light') {
    return (
      <SidebarMenuButton onClick={() => setTheme('dark')}>
        <FiSun />
        <span>Dark Mode </span>
      </SidebarMenuButton>
    );
  }
};

export default ColorThemeToggle;
