/**
 * 策略分析Tab導航組件
 * Strategy Analysis Tab Navigation Component
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StrategySignal } from '@/utils/strategyEngine';

interface StrategyTabsProps {
  activeTab: string;
  onTabChange: (tab: 'momentum' | 'mean_reversion' | 'breakout' | 'risk' | 'advice') => void;
  strategies: StrategySignal[];
}

const StrategyTabs: React.FC<StrategyTabsProps> = ({
  activeTab,
  onTabChange,
  strategies
}) => {
  const { t } = useTranslation();
  // 計算各策略的強度以顯示在Tab上
  const getStrategyStrength = (type: string) => {
    const strategy = strategies.find(s => s.type === type);
    return strategy ? Math.round(strategy.strength) : 0;
  };

  const getStrategySignal = (type: string) => {
    const strategy = strategies.find(s => s.type === type);
    return strategy?.signal || 'neutral';
  };

  const tabs = [
    {
      id: 'momentum',
      name: t('momentum_strategy'),
      icon: '📈',
      description: t('trend_direction'),
      strength: getStrategyStrength('momentum'),
      signal: getStrategySignal('momentum')
    },
    {
      id: 'mean_reversion',
      name: t('mean_reversion_strategy'),
      icon: '🔄',
      description: t('neutral'),
      strength: getStrategyStrength('mean_reversion'),
      signal: getStrategySignal('mean_reversion')
    },
    {
      id: 'breakout',
      name: t('breakout_strategy'),
      icon: '🚀',
      description: t('breakout_direction'),
      strength: getStrategyStrength('breakout'),
      signal: getStrategySignal('breakout')
    },
    {
      id: 'risk',
      name: t('risk_assessment'),
      icon: '⚠️',
      description: t('risk_level'),
      strength: 0,
      signal: 'neutral'
    },
    {
      id: 'advice',
      name: t('trading_advice'),
      icon: '💡',
      description: t('overall_assessment'),
      strength: 0,
      signal: 'neutral'
    }
  ];

  const getSignalColor = (signal: string, strength: number = 0) => {
    if (signal === 'bullish' && strength > 60) return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
    if (signal === 'bearish' && strength > 60) return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
    if (strength > 50) return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
    return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600';
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-1 px-4" aria-label={t('strategy_analysis')}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabColorClass = isActive 
            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`
                group relative min-w-0 flex-1 overflow-hidden py-3 px-1 text-center border-b-2 font-medium text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200
                ${tabColorClass}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex flex-col items-center space-y-1">
                {/* 圖標和名稱 */}
                <div className="flex items-center space-x-1">
                  <span className="text-base">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </div>
                
                {/* 描述和強度指示器 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {tab.description}
                  </span>
                  
                  {/* 策略強度指示器 (只有前三個策略顯示) */}
                  {['momentum', 'mean_reversion', 'breakout'].includes(tab.id) && (
                    <div className="flex items-center space-x-1">
                      <div className={`
                        px-1.5 py-0.5 rounded-full text-xs font-medium border
                        ${getSignalColor(tab.signal, tab.strength)}
                      `}>
                        {tab.strength}%
                      </div>
                      
                      {/* 信號狀態點 */}
                      <div className={`w-2 h-2 rounded-full ${
                        tab.signal === 'bullish' && tab.strength > 60 ? 'bg-green-500' :
                        tab.signal === 'bearish' && tab.strength > 60 ? 'bg-red-500' :
                        tab.strength > 50 ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  )}
                </div>
              </div>

              {/* 激活狀態下的額外視覺指示 */}
              {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default StrategyTabs;