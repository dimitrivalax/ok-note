import { expect, test, type Page } from '@playwright/test';

/**
 * Creates a persisted text note from the notes list.
 */
async function createTextNote(page: Page, title: string, content: string): Promise<void> {
  await page.getByTestId('create-note-fab').click();
  await page.getByRole('button', { name: 'Text note' }).click();
  await page.getByTestId('note-title-input').locator('input').fill(title);
  await page.getByTestId('note-content-input').locator('textarea').fill(content);
  await page.locator('ion-back-button').click();
  await expect(page.getByTestId('notes-list').getByRole('heading', { name: title })).toBeVisible();
}

test.describe('Note backup import and export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notes');
    await page.evaluate(() => indexedDB.deleteDatabase('ok-note'));
    await page.reload();
    await expect(page.getByTestId('menu-button')).toBeVisible();
    await expect(page.getByTestId('notes-search')).toBeVisible();
  });

  test('exports notes and restores them, replacing later local notes', async ({ page }) => {
    await createTextNote(page, 'Alpha', 'First note');
    await createTextNote(page, 'Beta', 'Second note');

    await page.goto('/settings');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('settings-export-notes').click();
    const download = await downloadPromise;
    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/^ok-note-backup-\d{4}-\d{2}-\d{2}\.json$/);
    await expect(page.getByText('Notes exported')).toBeVisible();

    await page.goto('/notes');
    await createTextNote(page, 'Gamma', 'Should disappear on import');

    await page.goto('/settings');
    await page.getByTestId('settings-import-notes').click();
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('alertdialog').getByRole('button', { name: 'Replace' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles(backupPath as string);

    await expect(page.getByText('Imported 2 notes')).toBeVisible();

    await page.goto('/notes');
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Alpha' })).toBeVisible();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Beta' })).toBeVisible();
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Gamma' })).toHaveCount(0);
  });

  test('does not replace notes when the backup file is invalid', async ({ page }) => {
    await createTextNote(page, 'Keep', 'Must remain');

    await page.goto('/settings');
    await page.getByTestId('settings-import-notes').click();
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('alertdialog').getByRole('button', { name: 'Replace' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{not-json', 'utf8'),
    });

    await expect(page.getByText('This file is not a valid Ok! Note backup')).toBeVisible();

    await page.goto('/notes');
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Keep' })).toBeVisible();
  });

  test('does not import when the replace confirmation is cancelled', async ({ page }) => {
    await createTextNote(page, 'Keep', 'Must remain');

    await page.goto('/settings');
    await page.getByTestId('settings-import-notes').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);

    await page.goto('/notes');
    await expect(page.getByTestId('notes-list').getByRole('heading', { name: 'Keep' })).toBeVisible();
  });
});
