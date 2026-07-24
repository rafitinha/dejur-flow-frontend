import { test, expect } from '@playwright/test';
test('home exibe título', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Validador de Ações Judiciais')).toBeVisible();
});
