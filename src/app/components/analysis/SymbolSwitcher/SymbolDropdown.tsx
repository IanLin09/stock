'use client';
import { useAnalysisStore } from '@/utils/zustand';
import { useState, useRef, useEffect } from 'react';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import {
  getAnalysisTextSize,
  getAnalysisSpacing,
} from '@/utils/analysis-responsive';

const supportedSymbols = ['QQQ', 'IBIT', 'TSLA'];

const SymbolDropdown = () => {
  const { currentSymbol, setCurrentSymbol } = useAnalysisStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();

  const textSize = getAnalysisTextSize('base', currentScreenSize);
  const padding = getAnalysisSpacing('sm', currentScreenSize, 'padding');

  const handleSymbolChange = (symbol: string) => {
    setCurrentSymbol(symbol);
    setIsOpen(false);
  };

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${textSize} ${padding} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 min-w-20`}
      >
        <span className="flex items-center justify-between">
          {currentSymbol}
          <svg
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="py-1">
            {supportedSymbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => handleSymbolChange(symbol)}
                className={`${textSize} ${padding} block w-full text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                  currentSymbol === symbol ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolDropdown;
