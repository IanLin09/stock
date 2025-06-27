import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import CountdownTimer from '../timer';

// Mock luxon DateTime
jest.mock('luxon', () => ({
  DateTime: {
    now: jest.fn(),
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        until_open: 'Until Market Opens',
      };
      return translations[key] || key;
    },
  }),
}));

const mockDateTime = DateTime as jest.Mocked<typeof DateTime>;

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createMockDateTime = (
    currentTime: number,
    openTime: number,
    closeTime: number,
    weekday: number = 3
  ) => {
    const mockDiff = jest.fn().mockReturnValue({
      toFormat: jest
        .fn()
        .mockReturnValue(weekday > 5 ? '48:30:00' : '01:30:00'),
      plus: jest.fn().mockReturnValue({
        toFormat: jest
          .fn()
          .mockReturnValue(weekday > 5 ? '48:30:00' : '25:30:00'),
      }),
    });

    const mockOpenTimeObj = {
      valueOf: jest.fn().mockReturnValue(openTime),
      diff: mockDiff,
    };

    const mockCloseTimeObj = {
      valueOf: jest.fn().mockReturnValue(closeTime),
    };

    const mockNowNY = {
      setZone: jest.fn().mockReturnThis(),
      set: jest
        .fn()
        .mockReturnValueOnce(mockOpenTimeObj)
        .mockReturnValueOnce(mockCloseTimeObj)
        .mockReturnValue(mockOpenTimeObj), // 為後續調用提供默認返回值
      weekday,
      valueOf: jest.fn().mockReturnValue(currentTime),
    };

    mockDateTime.now.mockReturnValue({
      setZone: jest.fn().mockReturnValue(mockNowNY),
    } as any);

    return { mockNowNY, mockOpenTimeObj, mockCloseTimeObj, mockDiff };
  };

  describe('Basic Functionality', () => {
    it('should render countdown when market is closed', async () => {
      createMockDateTime(1000, 1500, 2000);

      render(<CountdownTimer />);

      await waitFor(() => {
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();
      });
    });

    it('should use New York timezone', async () => {
      const setZoneSpy = jest.fn();
      mockDateTime.now.mockReturnValue({
        setZone: setZoneSpy,
      } as any);

      setZoneSpy.mockReturnValue({
        setZone: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnValue({
          valueOf: jest.fn().mockReturnValue(1500),
          diff: jest.fn().mockReturnValue({
            toFormat: jest.fn().mockReturnValue('01:30:00'),
          }),
        }),
        weekday: 3,
        valueOf: jest.fn().mockReturnValue(1000),
      });

      render(<CountdownTimer />);

      expect(setZoneSpy).toHaveBeenCalledWith('America/New_York');

      // 檢查組件實際顯示的內容
      await waitFor(() => {
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();
        expect(screen.getByTestId('countdown-timer')).toHaveTextContent(
          'Until Market Opens:01:30:00'
        );
      });
    });

    it('should render content after component is mounted', async () => {
      createMockDateTime(1000, 1500, 2000);

      render(<CountdownTimer />);

      await waitFor(() => {
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();
      });
    });
  });

  describe('Weekend Handling', () => {
    it('should add extra hours for Saturday', async () => {
      const { mockDiff } = createMockDateTime(1000, 1500, 2000, 6);

      render(<CountdownTimer />);

      await waitFor(() => {
        const display = screen.getByTestId('countdown-timer');
        expect(display).toHaveTextContent('48:30:00');
        expect(mockDiff().plus).toHaveBeenCalledWith({ hour: 48 });
      });
    });

    it('should add extra hours for Sunday', async () => {
      const { mockDiff } = createMockDateTime(1000, 1500, 2000, 7);

      render(<CountdownTimer />);

      await waitFor(() => {
        const display = screen.getByTestId('countdown-timer');
        expect(display).toHaveTextContent('48:30:00');
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('48:30:00')).toBeInTheDocument();
        expect(mockDiff().plus).toHaveBeenCalledWith({ hour: 24 });
      });
    });
  });

  describe('Component Props', () => {
    it('should use default values when no props provided', async () => {
      const { mockNowNY } = createMockDateTime(1000, 1500, 2000);

      render(<CountdownTimer />);

      await waitFor(() => {
        expect(mockNowNY.set).toHaveBeenCalledWith({
          hour: 9,
          minute: 30,
          second: 0,
        });
        expect(mockNowNY.set).toHaveBeenCalledWith({
          hour: 16,
          minute: 0,
          second: 0,
        });

        // 檢查組件實際顯示的內容
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();
        expect(screen.getByTestId('countdown-timer')).toHaveTextContent(
          'Until Market Opens:01:30:00'
        );
      });
    });

    it('should accept custom target times', async () => {
      createMockDateTime(1000, 1500, 2000);

      render(
        <CountdownTimer targetHour={10} targetMinute={45} targetSecond={30} />
      );

      await waitFor(() => {
        // 檢查組件實際顯示的內容
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();
        expect(screen.getByTestId('countdown-timer')).toHaveTextContent(
          'Until Market Opens:01:30:00'
        );

        // 確認組件渲染了倒計時
        const timerElement = screen.getByTestId('countdown-timer');
        expect(timerElement).toBeVisible();
      });
    });
  });

  describe('CSS Classes and Structure', () => {
    it('should render with correct CSS classes', async () => {
      createMockDateTime(1000, 1500, 2000);

      render(<CountdownTimer />);

      await waitFor(() => {
        // 檢查文字內容正確顯示
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();

        const container = screen
          .getByText('Until Market Opens:')
          .closest('div');
        expect(container).toHaveClass(
          'flex',
          'flex-col',
          'text-center',
          'justify-center',
          'h-full',
          'text-sm',
          'sm:text-base',
          'md:text-lg',
          'font-mono'
        );

        const timeDisplay = screen.getByText('01:30:00');
        expect(timeDisplay).toHaveClass(
          'text-xl',
          'sm:text-2xl',
          'md:text-3xl',
          'lg:text-4xl',
          'font-bold'
        );

        // 檢查整個計時器組件的內容
        const timerComponent = screen.getByTestId('countdown-timer');
        expect(timerComponent).toHaveTextContent('Until Market Opens:01:30:00');
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format time correctly', async () => {
      const { mockDiff } = createMockDateTime(1000, 1500, 2000);

      mockDiff.mockReturnValue({
        toFormat: jest.fn().mockReturnValue('02:45:30'),
        plus: jest.fn().mockReturnValue({
          toFormat: jest.fn().mockReturnValue('02:45:30'),
        }),
      });

      render(<CountdownTimer />);

      await waitFor(() => {
        // 檢查格式化的時間顯示
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('02:45:30')).toBeInTheDocument();

        // 檢查完整的組件內容
        const timerComponent = screen.getByTestId('countdown-timer');
        expect(timerComponent).toHaveTextContent('Until Market Opens:02:45:30');
        expect(timerComponent).toBeVisible();
      });
    });

    it('should handle zero padding correctly', async () => {
      const { mockDiff } = createMockDateTime(1000, 1500, 2000);

      mockDiff.mockReturnValue({
        toFormat: jest.fn().mockReturnValue('00:05:09'),
        plus: jest.fn().mockReturnValue({
          toFormat: jest.fn().mockReturnValue('00:05:09'),
        }),
      });

      render(<CountdownTimer />);

      await waitFor(() => {
        // 檢查零填充的時間格式
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('00:05:09')).toBeInTheDocument();

        // 檢查完整的組件內容和零填充格式
        const timerComponent = screen.getByTestId('countdown-timer');
        expect(timerComponent).toHaveTextContent('Until Market Opens:00:05:09');
        expect(timerComponent).toBeVisible();

        // 確認時間格式包含正確的零填充
        const timeElement = screen.getByText('00:05:09');
        expect(timeElement.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should clear interval on component unmount', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      createMockDateTime(1000, 1500, 2000);

      const { unmount } = render(<CountdownTimer />);

      // 先確認組件正確渲染
      await waitFor(() => {
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Translation', () => {
    it('should display translated text', async () => {
      createMockDateTime(1000, 1500, 2000);

      render(<CountdownTimer />);

      await waitFor(() => {
        // 檢查翻譯文字正確顯示
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();

        // 檢查翻譯文字在組件中的位置和可見性
        const translatedText = screen.getByText('Until Market Opens:');
        expect(translatedText).toBeVisible();

        // 檢查完整的組件內容包含翻譯文字
        const timerComponent = screen.getByTestId('countdown-timer');
        expect(timerComponent).toHaveTextContent('Until Market Opens:01:30:00');
      });
    });
  });

  describe('Props Interface', () => {
    it('should accept all defined props', async () => {
      createMockDateTime(1000, 1500, 2000);

      expect(() => {
        render(
          <CountdownTimer
            label="Custom Label"
            targetHour={8}
            targetMinute={0}
            targetSecond={0}
          />
        );
      }).not.toThrow();

      // 檢查組件渲染後的實際內容
      await waitFor(() => {
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();

        const timerComponent = screen.getByTestId('countdown-timer');
        expect(timerComponent).toHaveTextContent('Until Market Opens:01:30:00');
        expect(timerComponent).toBeVisible();
      });
    });
  });

  describe('Component State', () => {
    it('should maintain mounted state', async () => {
      createMockDateTime(1000, 1500, 2000);

      const { container } = render(<CountdownTimer />);

      // Component should be in the DOM
      expect(container).toBeInTheDocument();

      // Wait for the component to render content
      await waitFor(() => {
        expect(screen.getByText('Until Market Opens:')).toBeInTheDocument();
        expect(screen.getByText('01:30:00')).toBeInTheDocument();

        // 檢查組件掛載狀態和內容顯示
        const timerComponent = screen.getByTestId('countdown-timer');
        expect(timerComponent).toBeInTheDocument();
        expect(timerComponent).toHaveTextContent('Until Market Opens:01:30:00');
        expect(timerComponent).toBeVisible();

        // 檢查組件結構完整性
        const labelElement = screen.getByText('Until Market Opens:');
        const timeElement = screen.getByText('01:30:00');
        expect(labelElement).toBeVisible();
        expect(timeElement).toBeVisible();
      });
    });
  });
});
