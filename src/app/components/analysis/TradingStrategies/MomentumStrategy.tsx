/**
 * 動量策略分析組件
 * Momentum Strategy Analysis Component
 */

import React from 'react';
import type { StrategySignal, IndicatorJudgment } from '@/utils/strategyEngine';
import { mapActionToSignal } from '@/utils/strategyEngine';

interface MomentumStrategyProps {
  strategy: StrategySignal | null;
  indicators: IndicatorJudgment[];
  marketCondition: string;
  overallScore: number;
}

const MomentumStrategy: React.FC<MomentumStrategyProps> = ({
  strategy,
  indicators,
  marketCondition: _marketCondition, // eslint-disable-line @typescript-eslint/no-unused-vars
  overallScore: _overallScore, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  if (!strategy) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-lg font-medium">動量策略數據不足</p>
          <p className="text-sm mt-1">需要更多技術指標數據來進行分析</p>
        </div>
      </div>
    );
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
        return 'text-green-600 dark:text-green-400';
      case 'bearish':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 70)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (strength >= 50)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'strong':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Real indicator values from the engine
  const rsiJudgment = indicators.find((i) => i.indicator === 'RSI');
  const macdJudgment = indicators.find((i) => i.indicator === 'MACD');
  const maJudgment = indicators.find((i) => i.indicator === 'MA');

  const momentumIndicators = [
    {
      name: 'RSI動量',
      description: 'RSI指標顯示的動量強度',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '正向動量'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '負向動量'
            : '中性',
      detail: 'RSI > 50 且上升趨勢表示正向動量',
      strength: rsiJudgment ? Math.round(rsiJudgment.strength) : null,
    },
    {
      name: 'MACD趨勢',
      description: 'MACD指標的趨勢方向',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '金叉信號'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '死叉信號'
            : '無明確信號',
      detail: 'DIF線與DEA線的相對位置反映趨勢強度',
      strength: macdJudgment ? Math.round(macdJudgment.strength) : null,
    },
    {
      name: '價格動量',
      description: '價格相對均線的位置',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '突破均線'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '跌破均線'
            : '橫盤整理',
      detail: '價格與移動平均線的關係決定動量方向',
      strength: maJudgment ? Math.round(maJudgment.strength) : null,
    },
  ];

  const tradingRules = [
    {
      condition: 'RSI > 70 且 MACD 金叉',
      action: '考慮獲利了結或減倉',
      risk: 'medium',
      reasoning: '動量過強可能面臨回調風險',
    },
    {
      condition: 'RSI 50-70 且 MACD 持續看漲',
      action: '持續持有或加倉',
      risk: 'low',
      reasoning: '健康的上升動量，適合跟進',
    },
    {
      condition: 'RSI < 30 且 MACD 死叉結束',
      action: '等待反彈信號',
      risk: 'medium',
      reasoning: '超賣後可能出現技術性反彈',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 策略概況 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">📈</span>
            動量策略分析
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStrengthBadge(strategy.strength)}`}
            >
              強度: {Math.round(strategy.strength)}%
            </span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getConfidenceBadge(strategy.confidence)}`}
            >
              {strategy.confidence === 'strong'
                ? '高信心'
                : strategy.confidence === 'moderate'
                  ? '中等信心'
                  : '低信心'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(strategy.strength)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              動量強度
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getSignalColor(mapActionToSignal(strategy.action))}`}
            >
              {mapActionToSignal(strategy.action) === 'bullish'
                ? '看漲'
                : mapActionToSignal(strategy.action) === 'bearish'
                  ? '看跌'
                  : '中性'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              信號方向
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {strategy.riskLevel === 'high'
                ? '高'
                : strategy.riskLevel === 'medium'
                  ? '中'
                  : '低'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              風險等級
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>策略建議:</strong> {strategy.recommendation}
          </p>
        </div>
      </div>

      {/* 動量指標分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            動量指標分析
          </h5>
        </div>
        <div className="p-4 space-y-4">
          {momentumIndicators.map((indicator, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div
                className={`w-3 h-3 rounded-full mt-2 ${
                  indicator.status.includes('正向') ||
                  indicator.status.includes('金叉') ||
                  indicator.status.includes('突破')
                    ? 'bg-green-500'
                    : indicator.status.includes('負向') ||
                        indicator.status.includes('死叉') ||
                        indicator.status.includes('跌破')
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {indicator.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {indicator.strength !== null && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {indicator.strength}%
                      </span>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        indicator.status.includes('正向') ||
                        indicator.status.includes('金叉') ||
                        indicator.status.includes('突破')
                          ? 'text-green-600 dark:text-green-400'
                          : indicator.status.includes('負向') ||
                              indicator.status.includes('死叉') ||
                              indicator.status.includes('跌破')
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {indicator.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {indicator.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {indicator.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 交易規則 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            動量策略交易規則
          </h5>
        </div>
        <div className="p-4 space-y-4">
          {tradingRules.map((rule, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    條件: {rule.condition}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    操作: {rule.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    理由: {rule.reasoning}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    rule.risk === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : rule.risk === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {rule.risk === 'high'
                    ? '高風險'
                    : rule.risk === 'medium'
                      ? '中風險'
                      : '低風險'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 關鍵提醒 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 dark:text-yellow-400 text-xl mr-3">
            ⚠️
          </div>
          <div>
            <h6 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              動量策略關鍵提醒
            </h6>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• 動量策略適合趨勢明確的市場環境</li>
              <li>• 注意動量衰減的早期信號，及時調整倉位</li>
              <li>• 避免在震盪市場中使用純動量策略</li>
              <li>• 設置止損位控制回撤風險</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomentumStrategy;
