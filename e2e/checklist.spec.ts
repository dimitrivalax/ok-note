import { expect, test } from '@playwright/test';

test.describe('Checklist notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notes');
    await page.evaluate(() => indexedDB.deleteDatabase('ok-note'));
    await page.reload();
  });

  test('creates a checklist, checks an item, and keeps order controls', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Checklist' }).click();

    await page.getByTestId('note-title-input').locator('input').fill('À faire');

    const firstInput = page.locator('[data-testid^="checklist-text-"]').first().locator('input');
    await firstInput.fill('Écrire les tests');

    await page.getByTestId('add-checklist-item').click();
    const secondInput = page.locator('[data-testid^="checklist-text-"]').nth(1).locator('input');
    await secondInput.fill('Lancer Playwright');

    await expect(page.getByTestId('checklist-reorder')).toBeVisible();
    await expect(page.locator('ion-reorder')).toHaveCount(2);

    await page.locator('[data-testid^="checklist-check-"]').first().click();
    await expect(page.getByTestId('delete-note')).toBeVisible();

    await page.locator('ion-back-button').click();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'À faire' })).toBeVisible();
    await expect(page.getByTestId('note-completed-badge')).toHaveCount(0);
  });

  test('marks a checklist as done when every item is checked', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Checklist' }).click();

    await page.getByTestId('note-title-input').locator('input').fill('Courses');
    const firstInput = page.locator('[data-testid^="checklist-text-"]').first().locator('input');
    await firstInput.fill('Pain');
    await firstInput.press('Enter');

    const secondInput = page.locator('[data-testid^="checklist-text-"]').nth(1).locator('input');
    await expect(secondInput).toBeFocused();
    await secondInput.fill('Lait');

    await page.locator('[data-testid^="checklist-check-"]').nth(0).click();
    await page.locator('[data-testid^="checklist-check-"]').nth(1).click();
    await expect(page.getByTestId('delete-note')).toBeVisible();

    await page.locator('ion-back-button').click();
    const noteItem = page.getByTestId('notes-list').locator('.note-completed').first();
    await expect(noteItem).toBeVisible();
    await expect(page.getByTestId('note-completed-badge')).toHaveText('Done');
    await expect(noteItem.locator('.note-completed-text')).toHaveText('Pain · Lait');
  });
});
