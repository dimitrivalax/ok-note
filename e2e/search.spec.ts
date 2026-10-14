import { expect, test } from '@playwright/test';

test.describe('Note search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notes');
    await page.evaluate(() => indexedDB.deleteDatabase('ok-note'));
    await page.reload();
  });

  test('filters notes by title and content', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Text note' }).click();
    await page.getByTestId('note-title-input').locator('input').fill('Alpha');
    await page.getByTestId('note-content-input').locator('textarea').fill('Contenu alpha');
    await expect(page.getByTestId('delete-note')).toBeVisible();
    await page.locator('ion-back-button').click();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Alpha' })).toBeVisible();

    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Text note' }).click();
    await expect(page.getByTestId('editor-title')).toHaveText('New note');
    await page.getByTestId('note-title-input').locator('input').fill('Beta');
    await page.getByTestId('note-content-input').locator('textarea').fill('Contenu beta');
    await expect(page.getByTestId('delete-note')).toBeVisible();
    await page.locator('ion-back-button').click();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Beta' })).toBeVisible();

    await page.getByTestId('notes-search').locator('input').fill('alpha');
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Alpha' })).toBeVisible();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Beta' })).toHaveCount(0);
  });
});
