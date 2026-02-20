import { chromium, type Page, type BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Scenario Matrix ──

const DESTINATIONS = [
  'Maldives', 'Tokyo', 'Paris', 'Bali', 'Iceland',
  'Morocco', 'Barcelona', 'New York', 'Cape Town', 'Thailand',
];

const BUDGETS = ['$1,000', '$2,000', '$5,000', '$10,000'];

const GROUP_SIZES = ['solo', 'couple', 'family of 4', 'group of 6 friends'];

const TRIP_LENGTHS = ['3 days', '1 week', '10 days', '2 weeks'];

const TRAVEL_STYLES = ['relaxed', 'balanced', 'packed', 'adventure', 'luxury'];

interface ScenarioConfig {
  destination: string;
  budget: string;
  groupSize: string;
  tripLength: string;
  travelStyle: string;
}

interface CapturedMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  options?: string[];
}

interface BenchmarkResult {
  scenario: ScenarioConfig;
  messages: CapturedMessage[];
  fieldsCollected: string[];
  fieldCollectionOrder: string[];
  turnCount: number;
  confirmationFormat: string | null;
  totalDurationMs: number;
  errors: string[];
}

// ── Configuration ──

const LAYLA_URL = 'https://justlayla.com';
const OUTPUT_DIR = path.join(__dirname, 'benchmark-results');
const MAX_TURNS = 20;
const RESPONSE_TIMEOUT_MS = 45_000;
const BETWEEN_MESSAGE_DELAY_MS = 2000;

// Field detection patterns to identify what Layla collects
const FIELD_PATTERNS: Record<string, RegExp[]> = {
  destination: [/where|destination|city|country|place|travel to|headed/i],
  tripLength: [/how long|duration|days|weeks|nights/i],
  budget: [/budget|spend|cost|price|afford|per person/i],
  travelers: [/who|travel(l?)ing with|solo|couple|family|group|people|companions/i],
  dates: [/when|date|month|depart|arrive|timing/i],
  pace: [/pace|style|relax|packed|adventure|balanced|itinerary style/i],
  departureCity: [/fly(ing)? from|depart(ure|ing)?|origin|coming from|leaving from/i],
  accommodation: [/hotel|stay|airbnb|hostel|resort|accommodat/i],
  interests: [/interest|activit|experienc|food|culture|nature|nightlife/i],
};

function detectFieldsInMessage(text: string): string[] {
  const detected: string[] = [];
  for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      detected.push(field);
    }
  }
  return detected;
}

// ── Message generation based on scenario ──

function generateUserResponses(scenario: ScenarioConfig): string[] {
  const responses: string[] = [];

  responses.push(`I want to plan a trip to ${scenario.destination}`);

  const groupMap: Record<string, string> = {
    'solo': "Just me, traveling solo",
    'couple': "It's a couple's trip",
    'family of 4': "Family trip — 2 adults and 2 kids",
    'group of 6 friends': "Group of 6 friends",
  };
  responses.push(groupMap[scenario.groupSize] || scenario.groupSize);

  responses.push(`About ${scenario.tripLength}`);

  responses.push(`My budget is around ${scenario.budget} total`);

  const styleMap: Record<string, string> = {
    'relaxed': "I want a relaxed pace — lots of free time",
    'balanced': "Balanced — mix of activities and downtime",
    'packed': "Pack it in, I want to see everything",
    'adventure': "I'm looking for adventure and outdoor activities",
    'luxury': "Luxury experience — the best of everything",
  };
  responses.push(styleMap[scenario.travelStyle] || scenario.travelStyle);

  responses.push("Flying from New York");

  // Fallback answers for unexpected questions
  responses.push("I'm flexible on that");
  responses.push("Whatever you recommend");
  responses.push("That sounds good, let's go with that");
  responses.push("Yes, that looks great!");

  return responses;
}

// ── Core automation ──

async function waitForLaylaResponse(page: Page): Promise<string> {
  await page.waitForTimeout(1500);

  const startTime = Date.now();
  let lastText = '';

  while (Date.now() - startTime < RESPONSE_TIMEOUT_MS) {
    const messages = await page.locator('[class*="message"], [class*="Message"], [data-testid*="message"], [class*="chat"] [class*="bot"], [class*="chat"] [class*="assistant"], [class*="response"]').all();

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const text = (await lastMessage.textContent())?.trim() || '';

      if (text && text !== lastText) {
        lastText = text;
        await page.waitForTimeout(2000);
        const checkText = (await lastMessage.textContent())?.trim() || '';
        if (checkText === lastText) {
          return lastText;
        }
        lastText = checkText;
      }
    }
    await page.waitForTimeout(500);
  }

  return lastText || '[TIMEOUT - no response detected]';
}

async function captureOptions(page: Page): Promise<string[]> {
  const options: string[] = [];
  const buttons = await page.locator('button, [role="option"], [class*="chip"], [class*="option"], [class*="suggestion"]').all();

  for (const btn of buttons) {
    const text = (await btn.textContent())?.trim();
    if (text && text.length < 100 && text.length > 1) {
      options.push(text);
    }
  }
  return options;
}

async function sendMessage(page: Page, text: string): Promise<void> {
  const inputSelectors = [
    'textarea',
    'input[type="text"]',
    '[contenteditable="true"]',
    '[class*="input"]',
    '[class*="Input"]',
    '[data-testid*="input"]',
  ];

  for (const selector of inputSelectors) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(text);
      await page.waitForTimeout(300);

      const sendButton = page.locator('button[type="submit"], [class*="send"], [aria-label*="send"], [class*="Send"]').first();
      if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await sendButton.click();
      } else {
        await input.press('Enter');
      }
      return;
    }
  }

  throw new Error('Could not find chat input field');
}

async function runScenario(
  context: BrowserContext,
  scenario: ScenarioConfig,
  scenarioIndex: number,
): Promise<BenchmarkResult> {
  const page = await context.newPage();
  const startTime = Date.now();
  const messages: CapturedMessage[] = [];
  const fieldsCollected: Set<string> = new Set();
  const fieldCollectionOrder: string[] = [];
  const errors: string[] = [];
  let confirmationFormat: string | null = null;

  const userResponses = generateUserResponses(scenario);
  let responseIdx = 0;

  console.log(`\n[Scenario ${scenarioIndex + 1}] ${scenario.destination} | ${scenario.budget} | ${scenario.groupSize} | ${scenario.tripLength} | ${scenario.travelStyle}`);

  try {
    await page.goto(LAYLA_URL, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForTimeout(3000);

    // Look for a "start chat" or "plan trip" button
    const startButtons = await page.locator('button, a').filter({ hasText: /plan|start|chat|trip|begin|let.*go/i }).all();
    if (startButtons.length > 0) {
      await startButtons[0].click();
      await page.waitForTimeout(2000);
    }

    for (let turn = 0; turn < MAX_TURNS && responseIdx < userResponses.length; turn++) {
      // Capture assistant response if not the first turn
      if (turn > 0 || messages.length === 0) {
        const assistantText = await waitForLaylaResponse(page);
        if (assistantText && assistantText !== '[TIMEOUT - no response detected]') {
          const options = await captureOptions(page);
          messages.push({
            role: 'assistant',
            text: assistantText,
            timestamp: new Date().toISOString(),
            options: options.length > 0 ? options : undefined,
          });

          const detectedFields = detectFieldsInMessage(assistantText);
          for (const field of detectedFields) {
            if (!fieldsCollected.has(field)) {
              fieldsCollected.add(field);
              fieldCollectionOrder.push(field);
            }
          }

          // Detect confirmation/summary
          if (/summary|confirm|look(s)? (good|right|correct)|ready to (book|plan|generate)/i.test(assistantText)) {
            confirmationFormat = assistantText;
            messages.push({
              role: 'user',
              text: 'Yes, that looks great!',
              timestamp: new Date().toISOString(),
            });
            try {
              await sendMessage(page, 'Yes, that looks great!');
            } catch {
              errors.push('Failed to send confirmation');
            }
            await page.waitForTimeout(3000);
            const finalResponse = await waitForLaylaResponse(page);
            if (finalResponse) {
              messages.push({
                role: 'assistant',
                text: finalResponse,
                timestamp: new Date().toISOString(),
              });
            }
            break;
          }

          console.log(`  [Turn ${turn + 1}] Layla: ${assistantText.substring(0, 80)}...`);
        } else {
          errors.push(`Turn ${turn}: No response from Layla`);
        }
      }

      // Send next user response
      if (responseIdx < userResponses.length) {
        const userText = userResponses[responseIdx];
        responseIdx++;

        messages.push({
          role: 'user',
          text: userText,
          timestamp: new Date().toISOString(),
        });

        try {
          await sendMessage(page, userText);
          console.log(`  [Turn ${turn + 1}] User: ${userText}`);
        } catch (err) {
          errors.push(`Failed to send: "${userText}" - ${err}`);
          break;
        }

        await page.waitForTimeout(BETWEEN_MESSAGE_DELAY_MS);
      }
    }
  } catch (err) {
    errors.push(`Scenario error: ${err}`);
    console.error(`  [ERROR] ${err}`);
  } finally {
    await page.close();
  }

  return {
    scenario,
    messages,
    fieldsCollected: Array.from(fieldsCollected),
    fieldCollectionOrder,
    turnCount: messages.filter((m) => m.role === 'user').length,
    confirmationFormat,
    totalDurationMs: Date.now() - startTime,
    errors,
  };
}

// ── Matrix generation ──

function generateScenarioMatrix(options?: {
  maxScenarios?: number;
  sample?: 'full' | 'representative';
}): ScenarioConfig[] {
  const { maxScenarios, sample = 'full' } = options || {};

  if (sample === 'representative') {
    // One scenario per destination with varied other params
    return DESTINATIONS.map((dest, i) => ({
      destination: dest,
      budget: BUDGETS[i % BUDGETS.length],
      groupSize: GROUP_SIZES[i % GROUP_SIZES.length],
      tripLength: TRIP_LENGTHS[i % TRIP_LENGTHS.length],
      travelStyle: TRAVEL_STYLES[i % TRAVEL_STYLES.length],
    }));
  }

  // Full matrix
  const scenarios: ScenarioConfig[] = [];
  for (const destination of DESTINATIONS) {
    for (const budget of BUDGETS) {
      for (const groupSize of GROUP_SIZES) {
        for (const tripLength of TRIP_LENGTHS) {
          for (const travelStyle of TRAVEL_STYLES) {
            scenarios.push({ destination, budget, groupSize, tripLength, travelStyle });
          }
        }
      }
    }
  }

  if (maxScenarios && scenarios.length > maxScenarios) {
    const step = Math.ceil(scenarios.length / maxScenarios);
    return scenarios.filter((_, i) => i % step === 0).slice(0, maxScenarios);
  }

  return scenarios;
}

// ── Report generation ──

function generateSummaryReport(results: BenchmarkResult[]): string {
  const successful = results.filter((r) => r.errors.length === 0);
  const avgTurns = successful.reduce((s, r) => s + r.turnCount, 0) / (successful.length || 1);
  const avgDuration = successful.reduce((s, r) => s + r.totalDurationMs, 0) / (successful.length || 1);

  const fieldFrequency: Record<string, number> = {};
  const fieldOrderFirst: Record<string, number[]> = {};

  for (const result of successful) {
    for (const field of result.fieldsCollected) {
      fieldFrequency[field] = (fieldFrequency[field] || 0) + 1;
    }
    for (let i = 0; i < result.fieldCollectionOrder.length; i++) {
      const field = result.fieldCollectionOrder[i];
      if (!fieldOrderFirst[field]) fieldOrderFirst[field] = [];
      fieldOrderFirst[field].push(i + 1);
    }
  }

  const sortedFields = Object.entries(fieldFrequency).sort((a, b) => b[1] - a[1]);

  let report = `# Layla.ai Competitive Benchmark Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total scenarios run:** ${results.length}\n`;
  report += `- **Successful:** ${successful.length}\n`;
  report += `- **Failed:** ${results.length - successful.length}\n`;
  report += `- **Average turns to complete:** ${avgTurns.toFixed(1)}\n`;
  report += `- **Average conversation duration:** ${(avgDuration / 1000).toFixed(1)}s\n\n`;

  report += `## Field Collection Patterns\n\n`;
  report += `| Field | Times Collected | Avg Position Asked |\n`;
  report += `|-------|-----------------|--------------------|\n`;
  for (const [field, count] of sortedFields) {
    const positions = fieldOrderFirst[field] || [];
    const avgPos = positions.length > 0
      ? (positions.reduce((s, p) => s + p, 0) / positions.length).toFixed(1)
      : 'N/A';
    report += `| ${field} | ${count}/${successful.length} | ${avgPos} |\n`;
  }

  report += `\n## Fields Layla Collects That Vincent Might Not\n\n`;
  const vincentFields = new Set(['destination', 'tripLength', 'budget', 'pace', 'departureCity', 'travelers']);
  for (const [field] of sortedFields) {
    if (!vincentFields.has(field)) {
      report += `- **${field}** (collected in ${fieldFrequency[field]} conversations)\n`;
    }
  }

  report += `\n## Confirmation Message Patterns\n\n`;
  const confirmations = results.filter((r) => r.confirmationFormat).map((r) => r.confirmationFormat!);
  if (confirmations.length > 0) {
    report += `Found ${confirmations.length} confirmation messages. Sample:\n\n`;
    for (const conf of confirmations.slice(0, 3)) {
      report += `> ${conf.substring(0, 300)}...\n\n`;
    }
  } else {
    report += `No confirmation messages captured.\n\n`;
  }

  report += `## Error Summary\n\n`;
  const allErrors = results.flatMap((r) => r.errors);
  if (allErrors.length > 0) {
    const errorCounts: Record<string, number> = {};
    for (const err of allErrors) {
      const key = err.substring(0, 80);
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    }
    for (const [err, count] of Object.entries(errorCounts)) {
      report += `- ${err} (x${count})\n`;
    }
  } else {
    report += `No errors.\n`;
  }

  report += `\n## Recommendations for Vincent\n\n`;
  report += `Based on the benchmark data, consider:\n\n`;
  report += `1. **Field collection order:** Layla's typical order can inform Vincent's question grouping\n`;
  report += `2. **Additional fields:** Any fields Layla collects that Vincent doesn't should be evaluated\n`;
  report += `3. **Turn count:** If Layla completes intake in fewer turns, Vincent's question grouping may need optimization\n`;
  report += `4. **Confirmation format:** Compare Layla's summary format with Vincent's for completeness\n`;

  return report;
}

// ── Main entry point ──

async function main() {
  const args = process.argv.slice(2);
  const sampleMode = args.includes('--representative') ? 'representative' : 'full';
  const maxScenarios = parseInt(args.find((a) => a.startsWith('--max='))?.split('=')[1] || '0', 10) || undefined;
  const concurrency = parseInt(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1] || '1', 10);

  console.log('=== Layla.ai Competitive Benchmark ===');
  console.log(`Mode: ${sampleMode} | Max: ${maxScenarios || 'all'} | Concurrency: ${concurrency}`);

  const scenarios = generateScenarioMatrix({ maxScenarios, sample: sampleMode });
  console.log(`Generated ${scenarios.length} scenarios\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const results: BenchmarkResult[] = [];

  // Process in batches for concurrency
  for (let i = 0; i < scenarios.length; i += concurrency) {
    const batch = scenarios.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((scenario, j) => {
        const context = browser.newContext();
        return context.then((ctx) => runScenario(ctx, scenario, i + j).finally(() => ctx.close()));
      }),
    );

    for (const result of batchResults) {
      results.push(result);

      const filename = `scenario-${results.length}.json`;
      fs.writeFileSync(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify(result, null, 2),
      );
      console.log(`  Saved: ${filename}`);
    }
  }

  // Generate summary report
  const report = generateSummaryReport(results);
  const reportPath = path.join(OUTPUT_DIR, 'SUMMARY.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\nSummary report saved to: ${reportPath}`);

  // Save aggregated results
  const aggregatedPath = path.join(OUTPUT_DIR, 'all-results.json');
  fs.writeFileSync(aggregatedPath, JSON.stringify(results, null, 2));
  console.log(`All results saved to: ${aggregatedPath}`);

  await browser.close();
  console.log('\n=== Benchmark complete ===');
}

main().catch(console.error);
