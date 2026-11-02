import { Page, Locator } from '@playwright/test';
import { askAI } from './ai';

// Tries each selector in order. If all fail, asks the AI to find the element.
export async function findElement(page: Page, selectors: string[], description: string): Promise<Locator> {
  for (const selector of selectors) {
    const element = page.locator(selector).first();
    try {
      await element.waitFor({ timeout: 3000 });
      return element;
    } catch {
      console.log(`Selector failed: ${selector}`);
    }
  }

  console.log(`All selectors failed, asking AI to find: ${description}`);
  // Send only the interactive elements, so the prompt stays small and fast.
  const elements = await page
    .locator('input, button, a, select, textarea')
    .evaluateAll((els) => els.map((el) => el.outerHTML.slice(0, 200)));
  const answer = await askAI(
    `Find the CSS selector for: "${description}". Reply with ONLY the selector, nothing else.\n\nElements:\n${elements.join('\n')}`,
  );
  // Small models sometimes wrap the answer in ```css ... ```, so keep only the selector line.
  const aiSelector = answer
    .split('\n')
    .map((line) => line.replace(/`/g, '').replace(/\{.*$/, '').trim())
    .find((line) => line && line !== 'css')!;
  console.log(`AI suggested selector: ${aiSelector}`);
  return page.locator(aiSelector).first();
}
