import fs from 'fs';
import { chromium } from '@playwright/test';
import { askAI } from './ai';

// Usage: npm run generate -- "Log in and sort products by price"
const goal = process.argv[2] ?? 'Log in as standard_user and add a product to the cart';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com/');
  const html = await page.content();
  await browser.close();

  const code = await askAI(
    `Write a Playwright TypeScript test for https://www.saucedemo.com/ (password: secret_sauce).
Goal: ${goal}
Import { test, expect } from '@playwright/test'. Use data-test selectors. Reply with ONLY code, no markdown.

Login page HTML:
${html.slice(0, 20000)}`,
  );

  fs.writeFileSync('tests/generated.spec.ts', code.replace(/```(typescript|ts)?/g, '').trim() + '\n');
  console.log('Saved tests/generated.spec.ts');
}

main();
