/**
 * Formats volume numbers into compact notation
 * @param volume - The volume number to format
 * @returns Formatted string (e.g., "1.2M", "543.5K")
 * @note Uses toFixed() which applies "round half up" behavior (e.g., 1.25M rounds to 1.3M)
 */
export function formatVolume(volume: number): string {
  // Handle invalid numbers (NaN, Infinity) and negative numbers
  if (!isFinite(volume) || volume < 0) {
    return '0';
  }

  // Billions (>= 1,000,000,000)
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  }

  // Millions (>= 1,000,000)
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }

  // Thousands (>= 1,000)
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }

  // Less than 1000, display as-is
  return volume.toString();
}

/**
 * Formats percentage change between current and previous values
 * @param current - The current value
 * @param previous - The previous value
 * @returns Formatted percentage string (e.g., "+5.00%", "-3.25%", "N/A")
 * @note Uses toFixed() which applies "round half up" behavior (e.g., 5.125% rounds to 5.13%)
 */
export function formatPercentage(current: number, previous: number): string {
  // Validate inputs
  if (
    current == null ||
    previous == null ||
    previous === 0 ||
    !isFinite(current) ||
    !isFinite(previous)
  ) {
    return 'N/A';
  }

  // Calculate percentage change
  const percentageChange = ((current - previous) / previous) * 100;

  // Format with sign and 2 decimal places
  const sign = percentageChange >= 0 ? '+' : '';
  return `${sign}${percentageChange.toFixed(2)}%`;
}
