import { test, expect } from '@playwright/test';
import { randomUser } from '../config/testData';

test('user can buy a product with generated customer data', async ({ page }) => {
  const customer = randomUser();

  await page.goto('https://www.saucedemo.com/');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('[data-test="shopping-cart-link"]');
  await page.click('[data-test="checkout"]');

  await page.fill('[data-test="firstName"]', customer.firstName);
  await page.fill('[data-test="lastName"]', customer.lastName);
  await page.fill('[data-test="postalCode"]', customer.postalCode);
  await page.click('[data-test="continue"]');
  await page.click('[data-test="finish"]');

  await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
});
