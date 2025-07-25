/**
 * 均值回歸策略分析組件
 * Mean Reversion Strategy Analysis Component
 */

import React from 'react';
import type { StrategySignal } from '@/utils/strategyEngine';
import { mapActionToSignal } from '@/utils/strategyEngine';

interface MeanReversionStrategyProps {
  strategy: StrategySignal | null;
  marketCondition: string;
  overallScore: number;
}

const MeanReversionStrategy: React.FC<MeanReversionStrategyProps> = ({
  strategy,
  marketCondition: _marketCondition, // eslint-disable-line @typescript-eslint/no-unused-vars
  overallScore: _overallScore, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  if (!strategy) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-2">🔄</div>
          <p className="text-lg font-medium">均值回歸策略數據不足</p>
          <p className="text-sm mt-1">需要更多價格偏離數據來進行分析</p>
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

  const reversionIndicators = [
    {
      name: 'RSI極值',
      description: 'RSI在超買超賣區域的回歸機會',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '超賣反彈'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '超買回調'
            : '正常範圍',
      detail: 'RSI < 20 或 RSI > 80 提供最佳回歸機會',
      strength:
        strategy.strength > 70
          ? 'high'
          : strategy.strength > 50
            ? 'medium'
            : 'low',
    },
    {
      name: '價格偏離',
      description: '價格偏離移動平均線的程度',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '偏離過大'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '偏離過大'
            : '正常範圍',
      detail: '偏離MA20超過±5%通常會有回歸壓力',
      strength:
        strategy.strength > 70
          ? 'high'
          : strategy.strength > 50
            ? 'medium'
            : 'low',
    },
    {
      name: 'KDJ背離',
      description: 'KDJ指標與價格的背離程度',
      status:
        mapActionToSignal(strategy.action) === 'bullish'
          ? '底背離'
          : mapActionToSignal(strategy.action) === 'bearish'
            ? '頂背離'
            : '無背離',
      detail: '價格與KDJ背離是強烈的反轉信號',
      strength:
        strategy.strength > 60
          ? 'high'
          : strategy.strength > 40
            ? 'medium'
            : 'low',
    },
  ];

  const tradingScenarios = [
    {
      scenario: '強烈超賣反彈',
      conditions: ['RSI < 25', 'KDJ < 20', '偏離MA20 > -8%'],
      action: '分批建倉',
      risk: 'medium',
      successRate: '75%',
      expectedReturn: '5-12%',
      timeframe: '3-10天',
    },
    {
      scenario: '輕微超買回調',
      conditions: ['RSI > 75', '偏離MA20 > +5%', 'MACD頂背離'],
      action: '減倉或觀望',
      risk: 'low',
      successRate: '65%',
      expectedReturn: '3-8%',
      timeframe: '2-7天',
    },
    {
      scenario: '震盪區間操作',
      conditions: ['價格在支撐阻力間', 'RSI 30-70', '成交量萎縮'],
      action: '高拋低吸',
      risk: 'medium',
      successRate: '60%',
      expectedReturn: '2-6%',
      timeframe: '1-5天',
    },
  ];

  const riskFactors = [
    {
      factor: '趨勢風險',
      description: '強勢趨勢中的回歸可能失敗',
      mitigation: '結合趨勢指標確認大方向',
      level: 'high',
    },
    {
      factor: '時機風險',
      description: '過早進入可能面臨繼續偏離',
      mitigation: '分批建倉，降低時機風險',
      level: 'medium',
    },
    {
      factor: '假突破風險',
      description: '可能出現假突破導致損失',
      mitigation: '設置較緊的止損位',
      level: 'medium',
    },
  ];

  const getStrengthIndicator = (strength: string) => {
    switch (strength) {
      case 'high':
        return { color: 'bg-red-500', text: '強' };
      case 'medium':
        return { color: 'bg-yellow-500', text: '中' };
      default:
        return { color: 'bg-green-500', text: '弱' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 策略概況 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">🔄</span>
            均值回歸策略分析
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStrengthBadge(strategy.strength)}`}
            >
              回歸強度: {Math.round(strategy.strength)}%
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
              回歸概率
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getSignalColor(mapActionToSignal(strategy.action))}`}
            >
              {mapActionToSignal(strategy.action) === 'bullish'
                ? '超賣'
                : mapActionToSignal(strategy.action) === 'bearish'
                  ? '超買'
                  : '正常'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              偏離狀態
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
              操作風險
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              3-10天
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              預期時間
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded border-l-4 border-purple-400">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>回歸策略:</strong> {strategy.recommendation}
          </p>
        </div>
      </div>

      {/* 回歸指標分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            回歸指標分析
          </h5>
        </div>
        <div className="p-4 space-y-4">
          {reversionIndicators.map((indicator, index) => {
            const strengthInfo = getStrengthIndicator(indicator.strength);
            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {indicator.name}
                      </p>
                      <div
                        className={`w-3 h-3 rounded-full ${strengthInfo.color}`}
                        title={`${strengthInfo.text}強度`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {indicator.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {indicator.detail}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      indicator.status.includes('超賣') ||
                      indicator.status.includes('底背離')
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : indicator.status.includes('超買') ||
                            indicator.status.includes('頂背離')
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {indicator.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作場景 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            回歸操作場景
          </h5>
        </div>
        <div className="p-4 space-y-4">
          {tradingScenarios.map((scenario, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {scenario.scenario}
                </h6>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    scenario.risk === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : scenario.risk === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {scenario.risk === 'high'
                    ? '高風險'
                    : scenario.risk === 'medium'
                      ? '中風險'
                      : '低風險'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    觸發條件:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {scenario.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      建議操作:
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {scenario.action}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      成功率:
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {scenario.successRate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      預期收益:
                    </span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {scenario.expectedReturn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      時間周期:
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {scenario.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 風險因素 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            風險因素與對策
          </h5>
        </div>
        <div className="p-4 space-y-3">
          {riskFactors.map((risk, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      risk.level === 'high'
                        ? 'bg-red-500'
                        : risk.level === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  ></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {risk.factor}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    risk.level === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : risk.level === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {risk.level === 'high'
                    ? '高風險'
                    : risk.level === 'medium'
                      ? '中風險'
                      : '低風險'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {risk.description}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>對策:</strong> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 關鍵提醒 */}
      <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-orange-600 dark:text-orange-400 text-xl mr-3">
            🎯
          </div>
          <div>
            <h6 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
              均值回歸策略要點
            </h6>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• 適合橫盤或弱趨勢市場，避免在強趨勢中逆勢操作</li>
              <li>• 分批建倉降低時機風險，避免一次性全倉進入</li>
              <li>• 嚴格設置止損，防範趨勢延續的風險</li>
              <li>• 結合成交量分析，確認反轉的有效性</li>
              <li>• 耐心等待最佳回歸機會，不要強行操作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeanReversionStrategy;
