import { test, expect } from '@playwright/test';
import { findElement } from '../ai/selfHeal';

test('standard user can log in (self-healing demo)', async ({ page }) => {
  await page.goto('/');

  // The first selector is intentionally wrong, so the fallback is used.
  const username = await findElement(page, ['#old-username-id', '[data-test="username"]'], 'username input field');
  await username.fill('standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  await expect(page).toHaveURL(/inventory/);
});

test('locked out user sees an error', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('[data-test="username"]', 'locked_out_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  await expect(page.locator('[data-test="error"]')).toContainText('locked out');
});
