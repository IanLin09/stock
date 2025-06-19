'use client';
import dynamic from 'next/dynamic';
import i18n from './i18n';

const I18nextProvider = dynamic(
  () => import('react-i18next').then((mod) => mod.I18nextProvider),
  {
    ssr: false,
  }
);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
