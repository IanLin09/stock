/**
 * 風險評估組件
 * Risk Assessment Component
 */

import React from 'react';
import type { StrategySignal } from '@/utils/strategyEngine';

interface RiskAssessmentProps {
  strategies: StrategySignal[];
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  strategies,
  riskLevel,
  overallScore, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  // 計算風險統計數據
  const riskStats = {
    totalStrategies: strategies.length,
    highRiskCount: strategies.filter((s) => s.riskLevel === 'high').length,
    mediumRiskCount: strategies.filter((s) => s.riskLevel === 'medium').length,
    lowRiskCount: strategies.filter((s) => s.riskLevel === 'low').length,
    averageStrength:
      strategies.length > 0
        ? strategies.reduce((sum, s) => sum + s.strength, 0) / strategies.length
        : 0,
    strongSignals: strategies.filter((s) => s.confidence === 'strong').length,
    conflictingSignals:
      strategies.filter((s) => s.action === 'buy').length > 0 &&
      strategies.filter((s) => s.action === 'sell').length > 0,
  };

  // 風險等級配色
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    }
  };

  // 生成風險警告
  const generateRiskWarnings = () => {
    const warnings = [];

    if (riskStats.highRiskCount > 0) {
      warnings.push({
        level: 'high',
        title: '高風險策略警告',
        message: `當前有 ${riskStats.highRiskCount} 個高風險策略信號，建議控制倉位規模`,
        icon: '🚨',
      });
    }

    if (riskStats.conflictingSignals) {
      warnings.push({
        level: 'medium',
        title: '信號衝突警告',
        message: '存在相互矛盾的策略信號，建議等待市場方向明確',
        icon: '⚠️',
      });
    }

    if (riskStats.averageStrength < 50) {
      warnings.push({
        level: 'medium',
        title: '信號強度偏低',
        message: '平均策略強度不足50%，建議謹慎操作或等待更強信號',
        icon: '📉',
      });
    }

    if (riskStats.strongSignals === 0 && riskStats.totalStrategies > 0) {
      warnings.push({
        level: 'low',
        title: '缺乏強勢信號',
        message: '目前沒有高信心度策略，建議保持觀望',
        icon: '🔍',
      });
    }

    return warnings;
  };

  // 風險管理建議
  const riskManagementAdvice = {
    high: {
      positionSize: '10-30%',
      stopLoss: '較緊 (2-5%)',
      diversification: '高度分散',
      monitoring: '密切監控',
      advice: [
        '嚴格控制單筆投入金額',
        '設置較緊的止損位',
        '避免加槓桿操作',
        '準備快速退出策略',
      ],
    },
    medium: {
      positionSize: '30-60%',
      stopLoss: '適中 (3-8%)',
      diversification: '適度分散',
      monitoring: '定期檢查',
      advice: [
        '分批建倉降低風險',
        '設置合理止損位',
        '關注市場環境變化',
        '保持適度耐心',
      ],
    },
    low: {
      positionSize: '50-80%',
      stopLoss: '寬鬆 (5-10%)',
      diversification: '集中配置',
      monitoring: '週期性檢查',
      advice: [
        '可適當增加倉位',
        '給予足夠操作空間',
        '長期持有策略',
        '關注基本面變化',
      ],
    },
  };

  const currentAdvice = riskManagementAdvice[riskLevel];
  const warnings = generateRiskWarnings();

  return (
    <div className="space-y-6">
      {/* 風險概況 */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">⚖️</span>
            風險評估總覽
          </h4>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskLevel)}`}
          >
            {riskLevel === 'high'
              ? '高風險'
              : riskLevel === 'medium'
                ? '中等風險'
                : '低風險'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {riskStats.totalStrategies}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              策略總數
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {riskStats.highRiskCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              高風險
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {riskStats.strongSignals}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              強信號
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(riskStats.averageStrength)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              平均強度
            </div>
          </div>
        </div>
      </div>

      {/* 風險警告 */}
      {warnings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h5 className="text-md font-semibold text-gray-900 dark:text-white">
              風險警告
            </h5>
          </div>
          <div className="p-4 space-y-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${
                  warning.level === 'high'
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : warning.level === 'medium'
                      ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{warning.icon}</span>
                  <div>
                    <h6
                      className={`text-sm font-semibold mb-1 ${
                        warning.level === 'high'
                          ? 'text-red-800 dark:text-red-200'
                          : warning.level === 'medium'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {warning.title}
                    </h6>
                    <p
                      className={`text-sm ${
                        warning.level === 'high'
                          ? 'text-red-700 dark:text-red-300'
                          : warning.level === 'medium'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {warning.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 策略風險分布 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            策略風險分布
          </h5>
        </div>
        <div className="p-4">
          {strategies.length > 0 ? (
            <div className="space-y-3">
              {strategies.map((strategy, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        strategy.riskLevel === 'high'
                          ? 'bg-red-500'
                          : strategy.riskLevel === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {strategy.type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {strategy.action === 'buy'
                          ? '看漲'
                          : strategy.action === 'sell'
                            ? '看跌'
                            : '中性'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        strategy.riskLevel === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : strategy.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {strategy.riskLevel === 'high'
                        ? '高風險'
                        : strategy.riskLevel === 'medium'
                          ? '中風險'
                          : '低風險'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(strategy.strength)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>暫無策略數據</p>
            </div>
          )}
        </div>
      </div>

      {/* 風險管理建議 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">
            風險管理建議
          </h5>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 參數建議 */}
            <div className="space-y-4">
              <h6 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                參數建議
              </h6>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    建議倉位:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentAdvice.positionSize}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    止損設置:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentAdvice.stopLoss}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    分散程度:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentAdvice.diversification}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    監控頻率:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentAdvice.monitoring}
                  </span>
                </div>
              </div>
            </div>

            {/* 操作建議 */}
            <div className="space-y-4">
              <h6 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                操作要點
              </h6>
              <ul className="space-y-2">
                {currentAdvice.advice.map((advice, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {advice}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 風險檢查清單 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-blue-600 dark:text-blue-400 text-xl mr-3">
            📋
          </div>
          <div className="flex-1">
            <h6 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
              交易前風險檢查清單
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    已設置止損位
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    控制倉位大小
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    確認市場環境
                  </span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    準備退出策略
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    評估風險承受力
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    避免情緒化決策
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
