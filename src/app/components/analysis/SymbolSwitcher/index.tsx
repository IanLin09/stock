'use client';
import SymbolDropdown from './SymbolDropdown';
import PriceDisplay from './PriceDisplay';
import { useAnalysisBreakpoints } from '@/hooks/use-analysis-responsive';
import { getAnalysisSpacing } from '@/utils/analysis-responsive';

const SymbolSwitcher = () => {
  // 響應式 hooks
  const { currentScreenSize } = useAnalysisBreakpoints();

  const spacing = getAnalysisSpacing('sm', currentScreenSize, 'margin');

  return (
    <div className={`flex items-center ${spacing}`}>
      <SymbolDropdown />
      <PriceDisplay />
    </div>
  );
};

export default SymbolSwitcher;
