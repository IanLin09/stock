import { formatVolume, formatPercentage } from '../formatters';

describe('formatVolume', () => {
  describe('Billions formatting', () => {
    it('should format billions correctly', () => {
      expect(formatVolume(1234567890)).toBe('1.2B');
    });

    it('should format exact billions', () => {
      expect(formatVolume(5000000000)).toBe('5.0B');
    });

    it('should round billions to one decimal', () => {
      expect(formatVolume(1567890123)).toBe('1.6B');
    });
  });

  describe('Millions formatting', () => {
    it('should format millions correctly', () => {
      expect(formatVolume(1234567)).toBe('1.2M');
    });

    it('should format exact millions', () => {
      expect(formatVolume(3000000)).toBe('3.0M');
    });

    it('should round millions to one decimal', () => {
      expect(formatVolume(7890123)).toBe('7.9M');
    });
  });

  describe('Thousands formatting', () => {
    it('should format thousands correctly', () => {
      expect(formatVolume(543500)).toBe('543.5K');
    });

    it('should format exact thousands', () => {
      expect(formatVolume(8000)).toBe('8.0K');
    });

    it('should round thousands to one decimal', () => {
      expect(formatVolume(12345)).toBe('12.3K');
    });
  });

  describe('Small numbers', () => {
    it('should display numbers less than 1000 as-is', () => {
      expect(formatVolume(999)).toBe('999');
    });

    it('should display zero as-is', () => {
      expect(formatVolume(0)).toBe('0');
    });

    it('should display small numbers as-is', () => {
      expect(formatVolume(123)).toBe('123');
    });
  });

  describe('Negative numbers', () => {
    it('should return "0" for negative numbers', () => {
      expect(formatVolume(-1000)).toBe('0');
    });

    it('should return "0" for large negative numbers', () => {
      expect(formatVolume(-1234567890)).toBe('0');
    });
  });

  describe('Invalid numbers', () => {
    it('should return "0" for NaN', () => {
      expect(formatVolume(NaN)).toBe('0');
    });

    it('should return "0" for Infinity', () => {
      expect(formatVolume(Infinity)).toBe('0');
    });

    it('should return "0" for negative Infinity', () => {
      expect(formatVolume(-Infinity)).toBe('0');
    });
  });
});

describe('formatPercentage', () => {
  describe('Positive percentage change', () => {
    it('should format positive change with + sign', () => {
      expect(formatPercentage(105, 100)).toBe('+5.00%');
    });

    it('should format small positive change', () => {
      expect(formatPercentage(100.5, 100)).toBe('+0.50%');
    });

    it('should format fractional positive change', () => {
      expect(formatPercentage(100.1234, 100)).toBe('+0.12%');
    });
  });

  describe('Negative percentage change', () => {
    it('should format negative change with - sign', () => {
      expect(formatPercentage(95, 100)).toBe('-5.00%');
    });

    it('should format small negative change', () => {
      expect(formatPercentage(99.5, 100)).toBe('-0.50%');
    });

    it('should format large negative change', () => {
      expect(formatPercentage(50, 100)).toBe('-50.00%');
    });
  });

  describe('Zero change', () => {
    it('should format zero change with + sign', () => {
      expect(formatPercentage(100, 100)).toBe('+0.00%');
    });

    it('should format very small change as zero', () => {
      expect(formatPercentage(100.001, 100)).toBe('+0.00%');
    });
  });

  describe('Extreme changes', () => {
    it('should handle changes greater than 100%', () => {
      expect(formatPercentage(250, 100)).toBe('+150.00%');
    });

    it('should handle doubling', () => {
      expect(formatPercentage(200, 100)).toBe('+100.00%');
    });

    it('should handle near-zero current value', () => {
      expect(formatPercentage(1, 100)).toBe('-99.00%');
    });
  });

  describe('Invalid inputs', () => {
    it('should return "N/A" when previous is zero', () => {
      expect(formatPercentage(100, 0)).toBe('N/A');
    });

    it('should return "N/A" when current is null', () => {
      expect(formatPercentage(null as any, 100)).toBe('N/A');
    });

    it('should return "N/A" when current is undefined', () => {
      expect(formatPercentage(undefined as any, 100)).toBe('N/A');
    });

    it('should return "N/A" when previous is null', () => {
      expect(formatPercentage(100, null as any)).toBe('N/A');
    });

    it('should return "N/A" when previous is undefined', () => {
      expect(formatPercentage(100, undefined as any)).toBe('N/A');
    });

    it('should return "N/A" when both are null', () => {
      expect(formatPercentage(null as any, null as any)).toBe('N/A');
    });

    it('should return "N/A" when current is NaN', () => {
      expect(formatPercentage(NaN, 100)).toBe('N/A');
    });

    it('should return "N/A" when current is Infinity', () => {
      expect(formatPercentage(Infinity, 100)).toBe('N/A');
    });

    it('should return "N/A" when previous is NaN', () => {
      expect(formatPercentage(100, NaN)).toBe('N/A');
    });

    it('should return "N/A" when previous is Infinity', () => {
      expect(formatPercentage(100, Infinity)).toBe('N/A');
    });

    it('should return "N/A" when both are NaN', () => {
      expect(formatPercentage(NaN, NaN)).toBe('N/A');
    });
  });
});
