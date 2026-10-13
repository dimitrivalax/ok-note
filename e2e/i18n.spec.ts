import { expect, test } from '@playwright/test';

test.describe('Language switch', () => {
  test('switches Settings title between English and French', async ({ page }) => {
    await page.goto('/tabs/settings');
    await expect(page.getByTestId('settings-title')).toHaveText('Settings');

    await page.getByTestId('language-fr').click();
    await expect(page.getByTestId('settings-title')).toHaveText('Réglages');

    await page.getByTestId('language-en').click();
    await expect(page.getByTestId('settings-title')).toHaveText('Settings');
  });
});
