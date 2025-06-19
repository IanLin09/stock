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
