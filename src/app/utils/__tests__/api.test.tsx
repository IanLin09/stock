import { getRangeList } from '../api';

describe('getRangeList API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should throw error for 1D range (intraday not supported)', async () => {
    await expect(getRangeList('QQQ', '1D')).rejects.toThrow(
      'Intraday data (1D) is not available. Use 1M or longer timeframes.'
    );
  });

  test('should throw error for 1W range (intraday not supported)', async () => {
    await expect(getRangeList('QQQ', '1W')).rejects.toThrow(
      'Intraday data (1W) is not available. Use 1M or longer timeframes.'
    );
  });

  test('should call daily API for 1M range', async () => {
    const mockData = { data: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockData,
    });

    await getRangeList('QQQ', '1M');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/daily/RangeData?range=1'),
      expect.any(Object)
    );
  });
});
