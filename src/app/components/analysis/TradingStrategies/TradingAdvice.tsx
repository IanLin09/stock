/**
 * 交易建議組件
 * Trading Advice Component
 */

import React from 'react';
import type { StrategySignal } from '@/utils/strategyEngine';

interface TradingAdviceProps {
  actionAdvice: {
    primary: string;
    secondary: string[];
    warnings: string[];
    timeframe: string;
  };
  marketCondition: string;
  riskLevel: 'low' | 'medium' | 'high';
  strategies: StrategySignal[];
}

const TradingAdvice: React.FC<TradingAdviceProps> = ({
  actionAdvice,
  marketCondition,
  riskLevel,
  strategies
}) => {
  // 分析當前市場狀況
  const marketAnalysis = {
    condition: marketCondition,
    sentiment: marketCondition.includes('上漲') ? 'bullish' : 
              marketCondition.includes('下跌') ? 'bearish' : 'neutral',
    volatility: riskLevel === 'high' ? '高波動' : riskLevel === 'medium' ? '中等波動' : '低波動'
  };

  // 獲取最強策略
  const topStrategy = strategies.length > 0 ? 
    strategies.reduce((best, current) => current.strength > best.strength ? current : best, strategies[0]) : null;

  // 生成具體的操作步驟
  const generateActionSteps = () => {
    const action = actionAdvice.primary;
    
    if (action.includes('買入')) {
      return [
        {
          step: 1,
          title: '確認入場時機',
          description: '等待價格回調到關鍵支撐位或突破確認',
          timing: '即時-1小時內',
          priority: 'high'
        },
        {
          step: 2,
          title: '分批建倉',
          description: '分2-3批建立倉位，首批30-50%',
          timing: '1-3天內',
          priority: 'high'
        },
        {
          step: 3,
          title: '設置止損',
          description: `設置止損位在${riskLevel === 'high' ? '3-5%' : riskLevel === 'medium' ? '5-8%' : '8-12%'}`,
          timing: '建倉後立即',
          priority: 'critical'
        },
        {
          step: 4,
          title: '監控進展',
          description: '密切關注技術指標變化和成交量',
          timing: '持續',
          priority: 'medium'
        }
      ];
    } else if (action.includes('賣出')) {
      return [
        {
          step: 1,
          title: '評估賣出時機',
          description: '確認賣出信號的有效性，避免恐慌性操作',
          timing: '即時',
          priority: 'high'
        },
        {
          step: 2,
          title: '分批減倉',
          description: '分批減倉，首批減持50-70%',
          timing: '1-2天內',
          priority: 'high'
        },
        {
          step: 3,
          title: '保留觀察倉',
          description: '保留小部分倉位觀察後續走勢',
          timing: '減倉後',
          priority: 'medium'
        },
        {
          step: 4,
          title: '等待重新入場',
          description: '等待下一個明確的買入信號',
          timing: '後續',
          priority: 'low'
        }
      ];
    } else {
      return [
        {
          step: 1,
          title: '保持觀望',
          description: '維持當前倉位，避免頻繁交易',
          timing: '持續',
          priority: 'medium'
        },
        {
          step: 2,
          title: '監控信號',
          description: '密切關注技術指標的變化趨勢',
          timing: '日常',
          priority: 'medium'
        },
        {
          step: 3,
          title: '準備應對',
          description: '制定明確信號出現後的操作計劃',
          timing: '提前準備',
          priority: 'low'
        },
        {
          step: 4,
          title: '風險控制',
          description: '確保現有倉位的風險在可控範圍內',
          timing: '定期檢查',
          priority: 'high'
        }
      ];
    }
  };

  const actionSteps = generateActionSteps();

  // 生成市場情境分析
  const scenarioAnalysis = [
    {
      scenario: '最佳情況',
      probability: topStrategy ? Math.min(topStrategy.strength + 20, 95) : 60,
      description: topStrategy ? `${topStrategy.type}策略按預期發展` : '技術指標配合良好',
      expectedReturn: topStrategy?.signal === 'bullish' ? '+8-15%' : 
                      topStrategy?.signal === 'bearish' ? '避免-5-10%損失' : '+3-8%',
      timeframe: actionAdvice.timeframe || '1-2週'
    },
    {
      scenario: '中性情況',
      probability: 60,
      description: '市場橫盤整理，策略效果一般',
      expectedReturn: '±2-5%',
      timeframe: '2-4週'
    },
    {
      scenario: '最差情況',
      probability: Math.max(30 - (topStrategy?.strength || 0) / 3, 10),
      description: '策略失效，市場反向發展',
      expectedReturn: riskLevel === 'high' ? '-8-15%' : riskLevel === 'medium' ? '-5-10%' : '-3-8%',
      timeframe: '1-3週'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'bearish': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 主要建議概況 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">💡</span>
            交易建議總結
          </h4>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getSentimentColor(marketAnalysis.sentiment)}`}>
              {marketAnalysis.condition}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="text-center mb-4">
            <h5 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              {actionAdvice.primary}
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              預期操作時間框架: {actionAdvice.timeframe}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {marketAnalysis.condition}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">市場狀況</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {riskLevel === 'high' ? '高風險' : riskLevel === 'medium' ? '中等風險' : '低風險'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">風險等級</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {marketAnalysis.volatility}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">市場波動</div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作步驟 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">具體操作步驟</h5>
        </div>
        <div className="p-4 space-y-4">
          {actionSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-semibold">
                  {step.step}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h6 className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</h6>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(step.priority)}`}>
                      {step.priority === 'critical' ? '關鍵' : 
                       step.priority === 'high' ? '重要' : 
                       step.priority === 'medium' ? '一般' : '次要'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{step.timing}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 情境分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-white">情境分析</h5>
        </div>
        <div className="p-4 space-y-4">
          {scenarioAnalysis.map((scenario, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">{scenario.scenario}</h6>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  概率: {scenario.probability}%
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{scenario.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">預期收益:</span>
                  <span className={`ml-2 text-sm font-medium ${
                    scenario.expectedReturn.includes('+') ? 'text-green-600 dark:text-green-400' :
                    scenario.expectedReturn.includes('-') ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {scenario.expectedReturn}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">時間框架:</span>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {scenario.timeframe}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 輔助建議 */}
      {actionAdvice.secondary.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h5 className="text-md font-semibold text-gray-900 dark:text-white">輔助建議</h5>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {actionAdvice.secondary.map((advice, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 風險提醒 */}
      {actionAdvice.warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 dark:text-yellow-400 text-xl mr-3">⚠️</div>
            <div className="flex-1">
              <h6 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">重要提醒</h6>
              <ul className="space-y-1">
                {actionAdvice.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 行動檢查清單 */}
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-green-600 dark:text-green-400 text-xl mr-3">✅</div>
          <div className="flex-1">
            <h6 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3">操作前檢查清單</h6>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">確認交易信號的有效性</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">計算好風險收益比</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">設定止損和止盈位</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">確認市場環境配合度</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">準備好應急退出計劃</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingAdvice;