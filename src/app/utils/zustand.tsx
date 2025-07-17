import { create } from 'zustand';

interface DialogState {
  isOpen: boolean;
  dialogType?: string | null;
  dialogData?: any;
  openDialog: (type: string, data?: any) => void;
  closeDialog: () => void;
  toggleDialog?: () => void;
}

interface StockPriceColorStyle {
  isOpen: boolean;
  type: string;
  upColor: string;
  downColor: string;
  openDialog: () => void;
  closeDialog: () => void;
  changeType: (style: string) => void;
}

interface AnalysisState {
  currentSymbol: string;
  setCurrentSymbol: (symbol: string) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  activeTab: 'indicators' | 'reports' | 'strategies';
  setActiveTab: (tab: 'indicators' | 'reports' | 'strategies') => void;
  timeRange: '1D' | '1W' | '1M' | '3M' | '1Y';
  setTimeRange: (range: '1D' | '1W' | '1M' | '3M' | '1Y') => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  dialogType: null,
  dialogData: null,

  openDialog: (type: string, data?: any) =>
    set({ isOpen: true, dialogType: type, dialogData: data }),

  closeDialog: () => set({ isOpen: false, dialogType: null, dialogData: null }),

  toggleDialog: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useStockPriceStyle = create<StockPriceColorStyle>((set) => ({
  isOpen: false,
  type: 'US',

  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
  upColor: '#00FF00',
  downColor: '#FF0000',
  changeType: (style) => {
    if (style === 'US') {
      set({
        type: 'US',
        upColor: '#00FF00', // Green
        downColor: '#FF0000', // Red
      });
    } else {
      set({
        type: 'Asia',
        upColor: '#FF0000', // Red
        downColor: '#00FF00', // Green
      });
    }
  },
}));

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentSymbol: 'QQQ',
  setCurrentSymbol: (symbol: string) => set({ currentSymbol: symbol }),
  modalOpen: false,
  setModalOpen: (open: boolean) => set({ modalOpen: open }),
  activeTab: 'indicators',
  setActiveTab: (tab: 'indicators' | 'reports' | 'strategies') =>
    set({ activeTab: tab }),
  timeRange: '3M',
  setTimeRange: (range: '1D' | '1W' | '1M' | '3M' | '1Y') =>
    set({ timeRange: range }),
}));
