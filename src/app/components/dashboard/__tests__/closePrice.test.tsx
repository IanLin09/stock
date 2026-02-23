import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PreviousPrice } from '../closePrice';
import type { PreviousPriceDTO } from '@/utils/dto';

describe('PreviousPrice Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('fetches previous price for a symbol', async () => {
    const mockData: PreviousPriceDTO = {
      _id: '507f1f77bcf86cd799439011',
      datetime: '2026-02-21T00:00:00.000Z',
      close: 348.50,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockData,
    });

    const { result } = renderHook(() => PreviousPrice('QQQ'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API}/daily/previous?symbol=QQQ&range=1D`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
        },
      }
    );
  });

  test('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => PreviousPrice('TQQQ'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  test('does not fetch when symbol is empty', () => {
    const { result } = renderHook(() => PreviousPrice(''), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
