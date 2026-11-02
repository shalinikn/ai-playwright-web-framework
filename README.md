# AI-Native Playwright Framework

A beginner-friendly Playwright + TypeScript framework with AI features.
The AI runs **locally and for free** with [Ollama](https://ollama.com), or in the cloud with Gemini.

**Website under test:** https://www.saucedemo.com/

## Features

| Feature | File | What it does |
| --- | --- | --- |
| AI self-healing locators | `ai/selfHeal.ts` | Tries each selector in order. If all fail, the AI finds the element on the page. |
| AI failure analysis | `ai/aiReporter.ts` | When a test fails, the AI explains why and suggests a fix in `ai-failure-report.md`. |
| AI test generation | `ai/generateTest.ts` | Describe a test in plain English and the AI writes the code. |
| Synthetic test data | `config/testData.ts` | Creates random customers (name, postal code) for checkout. |
| Multi-user bot swarm | `tests/swarm.spec.ts` | 5 users shop at the same time, each in their own browser. |
| Parallel execution | `config/playwright.config.ts` | Tests run in parallel (`fullyParallel: true`). |

## Setup

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npx playwright install chromium
cp config/.env.example config/.env
```

### AI setup with Ollama (free, local)

1. Download Ollama from https://ollama.com/download.
   On older macOS versions where Homebrew fails, use the `ollama-darwin.tgz` file from
   the [Ollama GitHub releases](https://github.com/ollama/ollama/releases) instead.
2. Start Ollama and download the model (one time, about 1.9 GB):

```bash
ollama serve                    # keep this running in its own terminal
ollama pull qwen2.5-coder:3b
```

Ollama must be running whenever you use the AI features.

### AI setup with Gemini (optional)

Set these in `config/.env`:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here    # from https://aistudio.google.com/apikey
```

The free Gemini tier allows about 20 requests per day.

### `config/.env` settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `AI_PROVIDER` | `ollama` | Which AI to use: `ollama` or `gemini` |
| `OLLAMA_MODEL` | `qwen2.5-coder:3b` | Any model you have downloaded with `ollama pull` |
| `GEMINI_API_KEY` | | Only needed for Gemini |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Gemini model name |

## Commands

| Command | What it does |
| --- | --- |
| `npm test` | Run all tests |
| `npm run test:headed` | Run tests with the browser visible |
| `npm run report` | Open the HTML report |
| `npm run generate -- "Log in and sort products by price"` | Write a new test to `tests/generated.spec.ts` with AI |

## Tests

| Test | What it checks |
| --- | --- |
| `login.spec.ts` › standard user can log in | Login works. Uses a wrong selector on purpose to show self-healing. |
| `login.spec.ts` › locked out user sees an error | A blocked user sees the "locked out" error. |
| `checkout.spec.ts` | A full purchase using random customer data. |
| `swarm.spec.ts` | 5 SauceDemo users add to cart at the same time. |

## Tips

- **Always review AI-generated tests.** Run them and read them before keeping them.
  The small local model can guess wrong selectors. A bigger model (for example
  `qwen2.5-coder:7b`) writes better tests but is slower and needs more memory.
- **Each run of `npm run generate` overwrites** `tests/generated.spec.ts`. Rename the file to keep it.
- **The AI is only used when needed:** when all selectors fail, or when a test fails.
  Passing tests never call the AI.
- **If Ollama is not running**, the tests that don't need AI still pass. A test that needs
  self-healing fails with an AI error, and the failure report says the AI was unavailable.

## Project structure

```
ai/                    All AI features
  ai.ts                Sends prompts to Ollama or Gemini
  selfHeal.ts          Self-healing element finder
  aiReporter.ts        AI failure analysis reporter
  generateTest.ts      AI test generator
config/                Settings, test data and API keys
  .env                 Your API keys and AI settings (not committed to git)
  .env.example         Template for .env
  playwright.config.ts Playwright settings
  testData.ts          Random test data
playwright.config.ts   Points to config/playwright.config.ts
tests/
  login.spec.ts        Login + self-healing demo
  checkout.spec.ts     Checkout with random data
  swarm.spec.ts        Multiple users at once
.github/workflows/
  playwright.yml       Runs the tests on GitHub Actions
```

The Playwright settings live in `config/playwright.config.ts`. The one-line `playwright.config.ts`
in the project root just points to it, so `npm test` and `npx playwright test` both work.

## CI (GitHub Actions)

Every push and pull request runs the tests and uploads the HTML report.
Ollama is not available on GitHub Actions, so the workflow uses Gemini. To turn on AI there,
add `GEMINI_API_KEY` as a repository secret.

## Tech stack

Playwright · TypeScript · Node.js · Ollama / Gemini API · GitHub Actions
