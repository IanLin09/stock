'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  if (mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Switch onClick={toggleLanguage} id="airplane-mode" />
        <Label htmlFor="airplane-mode">
          Switch to {i18n.language === 'en' ? '中文' : 'English'}
        </Label>
      </div>
    );
  }
};
