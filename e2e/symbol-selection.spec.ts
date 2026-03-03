import { test, expect } from '@playwright/test';

const SYMBOLS = ['IBIT', 'NVDL', 'QQQ', 'TQQQ', 'TSLA'];

test.describe('Symbol selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the stock list to be populated
    await page.getByTestId('stock-row-QQQ').waitFor({ state: 'visible' });
  });

  for (const symbol of SYMBOLS) {
    test(`clicking ${symbol} shows its name and price in the chart header`, async ({
      page,
    }) => {
      await page.getByTestId(`stock-row-${symbol}`).click();

      await expect(page.getByTestId('panel-symbol')).toHaveText(symbol);
      await expect(page.getByTestId('panel-price')).not.toBeEmpty();
    });
  }

  for (const symbol of SYMBOLS) {
    test(`clicking ${symbol} shows the indicators section`, async ({ page }) => {
      await page.getByTestId(`stock-row-${symbol}`).click();

      await expect(page.getByTestId('indicators-section')).toBeVisible();
    });
  }
});
