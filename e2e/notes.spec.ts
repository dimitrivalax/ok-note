import { expect, test } from '@playwright/test';

test.describe('Text notes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tabs/notes');
    await page.evaluate(() => indexedDB.deleteDatabase('ok-note'));
    await page.reload();
    await expect(page.getByTestId('notes-title')).toBeVisible();
  });

  test('creates, edits, and deletes a text note', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Text note' }).click();

    await expect(page.getByTestId('editor-title')).toBeVisible();
    await page.getByTestId('note-title-input').locator('input').fill('Courses');
    await page.getByTestId('note-content-input').locator('textarea').fill('Acheter du pain');
    await page.getByTestId('save-note').click();

    await expect(page.getByText('Note created')).toBeVisible();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Courses' })).toBeVisible();
    await expect(page.getByTestId('notes-list').getByText('Acheter du pain', { exact: true })).toBeVisible();

    await page.getByTestId('notes-list').getByRole('heading', { name: 'Courses' }).click();
    await page.getByTestId('note-content-input').locator('textarea').fill('Acheter du pain et du lait');
    await page.getByTestId('save-note').click();
    await expect(page.getByText('Note saved')).toBeVisible();

    await page.locator('ion-back-button').click();
    await expect(
      page.getByTestId('notes-list').getByText('Acheter du pain et du lait', { exact: true })
    ).toBeVisible();

    await page.getByTestId('notes-list').getByRole('heading', { name: 'Courses' }).click();
    await page.getByTestId('delete-note').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByTestId('notes-empty')).toBeVisible();
  });

  test('refuses to create a text note without content', async ({ page }) => {
    await page.getByTestId('create-note-fab').click();
    await page.getByRole('button', { name: 'Text note' }).click();
    await page.getByTestId('note-title-input').locator('input').fill('Vide');
    await page.getByTestId('save-note').click();

    await expect(page.getByText('Content required')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
  });
});
