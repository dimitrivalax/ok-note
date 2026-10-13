import { expect, test } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('switches between light and dark mode', async ({ page }) => {
    await page.goto('/tabs/settings');
    await expect(page.getByTestId('settings-title')).toBeVisible();

    const html = page.locator('html');
    await expect(html).not.toHaveClass(/ion-palette-dark/);

    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveClass(/ion-palette-dark/);

    await page.getByTestId('theme-toggle').click();
    await expect(html).not.toHaveClass(/ion-palette-dark/);
  });
});
