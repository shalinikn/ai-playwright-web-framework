import { test, expect } from '@playwright/test';

const users = ['standard_user', 'problem_user', 'performance_glitch_user', 'visual_user', 'error_user'];

// Bot swarm: several users shop at the same time, each in its own browser context.
test('multiple users add to cart at the same time', async ({ browser }) => {
  test.setTimeout(120_000);

  await Promise.all(
    users.map(async (username) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('https://www.saucedemo.com/');
      await page.fill('[data-test="username"]', username);
      await page.fill('[data-test="password"]', 'secret_sauce');
      await page.click('[data-test="login-button"]');
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

      await context.close();
    }),
  );
});
