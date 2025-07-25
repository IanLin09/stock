/**
 * 突破策略分析組件
 * Breakout Strategy Analysis Component
 */

import React from 'react';
import type { StrategySignal } from '@/utils/strategyEngine';
import { mapActionToSignal } from '@/utils/strategyEngine';

interface BreakoutStrategyProps {
  strategy: StrategySignal | null;
  marketCondition: string;
  overallScore: number;
}

const BreakoutStrategy: React.FC<BreakoutStrategyProps> = ({
  strategy,
  marketCondition: _marketCondition, // eslint-disable-line @typescript-eslint/no-unused-vars
  overallScore: _overallScore, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  if (!strategy) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-lg font-medium">突破策略數據不足</p>
          <p className="text-sm mt-1">需要更多價格形態數據來進行分析</p>
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

  const breakoutIndicators = [
    {
      name: '價格突破',
      description: '價格突破關鍵阻力或支撐位',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '上行突破'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '下行突破'
            : '整理中',
      detail: '有效突破需要價格明確突破且保持在突破位之上',
      strength:
        strategy.strength > 75
          ? 'strong'
          : strategy.strength > 50
            ? 'moderate'
            : 'weak',
    },
    {
      name: 'MACD動量',
      description: 'MACD指標的動量確認',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '動量確認'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '動量確認'
            : '動量不足',
      detail: 'MACD金叉配合價格突破提供雙重確認',
      strength:
        strategy.strength > 70
          ? 'strong'
          : strategy.strength > 50
            ? 'moderate'
            : 'weak',
    },
    {
      name: '成交量放大',
      description: '突破時的成交量變化',
      status:
        strategy.strength > 60
          ? '放量突破'
          : strategy.strength > 40
            ? '溫和放量'
            : '縮量突破',
      detail: '有效突破通常伴隨成交量的明顯放大',
      strength:
        strategy.strength > 70
          ? 'strong'
          : strategy.strength > 45
            ? 'moderate'
            : 'weak',
    },
  ];

  const breakoutPatterns = [
    {
      pattern: '向上突破阻力',
      description: '價格突破重要阻力位',
      conditions: ['價格突破MA20/50', 'MACD金叉確認', '成交量放大'],
      action: '追進做多',
      risk: 'medium',
      target: '+8-15%',
      stopLoss: '-3-5%',
      validity:
        mapActionToSignal(strategy.action) === 'bullish' &&
        strategy.strength > 60,
    },
    {
      pattern: '向下突破支撐',
      description: '價格跌破重要支撐位',
      conditions: ['價格跌破MA20/50', 'MACD死叉確認', '成交量放大'],
      action: '止損或做空',
      risk: 'high',
      target: '-8-15%',
      stopLoss: '+3-5%',
      validity:
        mapActionToSignal(strategy.action) === 'bearish' &&
        strategy.strength > 60,
    },
    {
      pattern: '三角形突破',
      description: '價格突破三角形整理形態',
      conditions: ['整理期間縮量', '突破時放量', '方向性明確'],
      action: '跟進突破方向',
      risk: 'medium',
      target: '±5-12%',
      stopLoss: '±2-4%',
      validity: strategy.strength > 50,
    },
    {
      pattern: '假突破',
      description: '突破後快速回落的假突破',
      conditions: ['突破無量', '快速回落', 'MACD背離'],
      action: '反向操作',
      risk: 'high',
      target: '±3-8%',
      stopLoss: '±2-3%',
      validity: strategy.strength < 40,
    },
  ];

  const getPatternValidityColor = (validity: boolean) => {
    return validity
      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-gray-300 bg-gray-50 dark:bg-gray-800';
  };

  const getStrengthIndicator = (strength: string) => {
    switch (strength) {
      case 'strong':
        return { color: 'bg-green-500', text: '強', width: 'w-full' };
      case 'moderate':
        return { color: 'bg-yellow-500', text: '中', width: 'w-2/3' };
      default:
        return { color: 'bg-red-500', text: '弱', width: 'w-1/3' };
    }
  };

  const tradingRules = [
    {
      title: '突破確認原則',
      rules: [
        '等待價格明確突破並站穩關鍵位',
        '觀察成交量是否有效放大',
        '確認MACD等動量指標配合',
        '避免在消息面真空期操作',
      ],
    },
    {
      title: '風險控制要點',
      rules: [
        '設置緊密止損，防範假突破',
        '分批建倉，降低單次風險',
        '注意大盤環境的配合度',
        '準備應對突破失敗的預案',
      ],
    },
    {
      title: '獲利了結策略',
      rules: [
        '達到預期目標位考慮減倉',
        '動量衰減時逐步獲利了結',
        '遇到重要阻力位分批減倉',
        '保留核心倉位跟蹤趨勢',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* 策略概況 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">🚀</span>
            突破策略分析
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStrengthBadge(strategy.strength)}`}
            >
              突破強度: {Math.round(strategy.strength)}%
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(strategy.strength)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              突破概率
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getSignalColor(mapActionToSignal(strategy.action))}`}
            >
              {mapActionToSignal(strategy.action) === 'bullish'
                ? '向上'
                : mapActionToSignal(strategy.action) === 'bearish'
                  ? '向下'
                  : '待定'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              突破方向
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
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              1-5天
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              確認期
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded border-l-4 border-indigo-400">
          <p className="text-sm text-indigo-800 dark:text-indigo-200">
            <strong>突破策略:</strong> {strategy.recommendation}
          </p>
        </div>
      </div>

      {/* 突破指標分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            突破指標分析
          </h5>
        </div>
        <div className="p-4 space-y-4">
          {breakoutIndicators.map((indicator, index) => {
            const strengthInfo = getStrengthIndicator(indicator.strength);
            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {indicator.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          indicator.status.includes('突破') ||
                          indicator.status.includes('確認') ||
                          indicator.status.includes('放量')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : indicator.status.includes('不足') ||
                                indicator.status.includes('縮量')
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {indicator.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {indicator.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {indicator.detail}
                    </p>

                    {/* 強度進度條 */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        強度:
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${strengthInfo.color} ${strengthInfo.width}`}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {strengthInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 突破形態分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            突破形態識別
          </h5>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakoutPatterns.map((pattern, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 transition-all ${getPatternValidityColor(pattern.validity)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {pattern.pattern}
                </h6>
                <div className="flex items-center space-x-1">
                  {pattern.validity && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      pattern.risk === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {pattern.risk === 'high' ? '高風險' : '中風險'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {pattern.description}
              </p>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    觸發條件:
                  </p>
                  <ul className="text-sm space-y-1">
                    {pattern.conditions.map((condition, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      建議操作:
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {pattern.action}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      目標位:
                    </p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {pattern.target}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      止損位:
                    </p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {pattern.stopLoss}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 交易規則 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            突破策略交易規則
          </h5>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tradingRules.map((section, index) => (
            <div key={index} className="space-y-3">
              <h6 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                {section.title}
              </h6>
              <ul className="space-y-2">
                {section.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 關鍵提醒 */}
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-red-600 dark:text-red-400 text-xl mr-3">⚡</div>
          <div>
            <h6 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              突破策略關鍵提醒
            </h6>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>
                • <strong>假突破風險:</strong>{' '}
                50-60%的突破可能是假突破，需要嚴格止損
              </li>
              <li>
                • <strong>成交量確認:</strong> 有效突破必須伴隨成交量放大
              </li>
              <li>
                • <strong>時機選擇:</strong> 避免在重要事件前後進行突破操作
              </li>
              <li>
                • <strong>大盤配合:</strong> 個股突破需要大盤環境的配合
              </li>
              <li>
                • <strong>快進快出:</strong>{' '}
                突破策略講究時效性，錯過最佳時機要果斷放棄
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakoutStrategy;
