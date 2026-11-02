import fs from 'fs';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { askAI } from './ai';

// Custom reporter: when a test fails, asks the AI why and saves the answer to a file.
export default class AiReporter implements Reporter {
  private analyses: Promise<string>[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed' || result.status === 'timedOut') {
      const error = (result.error?.message ?? 'Unknown error').replace(/\u001b\[[0-9;]*m/g, '');
      this.analyses.push(this.analyze(test.title, error));
    }
  }

  async analyze(title: string, error: string) {
    let analysis: string;
    try {
      analysis = await askAI(
        `A Playwright test failed. Give the likely root cause and a fix in 3 short bullet points.\nTest: ${title}\nError: ${error}`,
      );
    } catch (e) {
      analysis = `AI analysis unavailable: ${(e as Error).message}`;
    }
    return `## ${title}\n\n**Error:**\n\`\`\`\n${error}\n\`\`\`\n\n**AI analysis:**\n${analysis}\n`;
  }

  async onEnd() {
    if (this.analyses.length === 0) return;
    const sections = await Promise.all(this.analyses);
    fs.writeFileSync('ai-failure-report.md', `# AI Failure Report\n\n${sections.join('\n')}`);
    console.log('AI failure report saved to ai-failure-report.md');
  }
}
