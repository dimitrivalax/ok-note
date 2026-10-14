import { expect, test } from '@playwright/test';

test.describe('Text notes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notes');
    await page.evaluate(() => indexedDB.deleteDatabase('ok-note'));
    await page.reload();
    await expect(page.getByTestId('menu-button')).toBeVisible();
    await expect(page.getByTestId('notes-search')).toBeVisible();
  });

  test('creates, edits, and deletes a text note', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Text note' }).click();

    await expect(page.getByTestId('editor-title')).toBeVisible();
    await page.getByTestId('note-title-input').locator('input').fill('Courses');
    await page.getByTestId('note-content-input').locator('textarea').fill('Acheter du pain');
    await expect(page.getByTestId('delete-note')).toBeVisible();

    await page.locator('ion-back-button').click();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Courses' })).toBeVisible();
    await expect(page.getByTestId('notes-list').getByText('Acheter du pain', { exact: true })).toBeVisible();

    await page.getByTestId('notes-list').getByRole('heading', { name: 'Courses' }).click();
    const contentInput = page.getByTestId('note-content-input').locator('textarea');
    await contentInput.fill('Acheter du pain et du lait');
    await expect(contentInput).toHaveValue('Acheter du pain et du lait');
    await contentInput.blur();

    await page.locator('ion-back-button').click();
    await expect(
      page.getByTestId('notes-list').getByText('Acheter du pain et du lait', { exact: true })
    ).toBeVisible();

    await page.getByTestId('notes-list').getByRole('heading', { name: 'Courses' }).click();
    await page.getByTestId('delete-note').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByTestId('notes-empty')).toBeVisible();
  });

  test('does not persist a text note without content', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Text note' }).click();
    await page.getByTestId('note-title-input').locator('input').fill('Vide');
    await expect(page.getByTestId('delete-note')).toHaveCount(0);

    await page.locator('ion-back-button').click();
    await expect(page.getByTestId('notes-empty')).toBeVisible();
  });
});
