#!/usr/bin/env npx tsx
/**
 * Evaluation suite for the Heavy Metal Facts chatbot.
 *
 * Usage:
 *   npx tsx scripts/evaluate.ts                # Run all tests
 *   npx tsx scripts/evaluate.ts --verbose      # Show full responses
 *   npx tsx scripts/evaluate.ts --api <url>    # Test against a specific API URL
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY
 */

import 'dotenv/config';

interface TestCase {
  id: string;
  question: string;
  /** Keywords that SHOULD appear in the response */
  expectPresent?: string[];
  /** Keywords that should NOT appear (hallucination checks) */
  expectAbsent?: string[];
  /** If true, the response must include at least one citation/source */
  expectCitation?: boolean;
  /** If true, expect a disclaimer (medical/health topic) */
  expectDisclaimer?: boolean;
  /** If true, expect the bot to say the info is not on the site */
  expectNotOnSite?: boolean;
}

const TEST_CASES: TestCase[] = [
  // --- Lead ---
  {
    id: 'lead-health-effects',
    question: 'What are the health effects of lead exposure?',
    expectPresent: ['lead', 'neurological', 'children'],
    expectCitation: true,
    expectDisclaimer: true,
  },
  {
    id: 'lead-drinking-water',
    question: 'What is the EPA action level for lead in drinking water?',
    expectPresent: ['15', 'ppb'],
    expectCitation: true,
  },
  {
    id: 'lead-sources',
    question: 'How does lead get into food?',
    expectPresent: ['lead', 'contamination'],
    expectCitation: true,
  },
  {
    id: 'lead-testing',
    question: 'What testing methods are used to detect lead in food?',
    expectPresent: ['ICP'],
    expectCitation: true,
  },

  // --- Arsenic ---
  {
    id: 'arsenic-rice',
    question: 'Why is arsenic commonly found in rice?',
    expectPresent: ['arsenic', 'rice'],
    expectCitation: true,
  },
  {
    id: 'arsenic-speciation',
    question: 'What is the difference between organic and inorganic arsenic?',
    expectPresent: ['inorganic', 'organic'],
    expectCitation: true,
  },
  {
    id: 'arsenic-standards',
    question: 'What are the FDA limits for arsenic in apple juice?',
    expectPresent: ['arsenic'],
    expectCitation: true,
  },

  // --- Cadmium ---
  {
    id: 'cadmium-food',
    question: 'Which foods are highest in cadmium?',
    expectPresent: ['cadmium'],
    expectCitation: true,
  },
  {
    id: 'cadmium-kidney',
    question: 'How does cadmium affect the kidneys?',
    expectPresent: ['kidney'],
    expectCitation: true,
    expectDisclaimer: true,
  },

  // --- Mercury ---
  {
    id: 'mercury-fish',
    question: 'Which fish have the highest mercury levels?',
    expectPresent: ['mercury', 'fish'],
    expectCitation: true,
  },
  {
    id: 'mercury-methylmercury',
    question: 'What is methylmercury and why is it dangerous?',
    expectPresent: ['methylmercury'],
    expectCitation: true,
  },

  // --- Standards / thresholds ---
  {
    id: 'standards-comparison',
    question: 'How do US and EU cadmium limits for chocolate compare?',
    expectPresent: ['cadmium'],
    expectCitation: true,
  },
  {
    id: 'standards-prop65',
    question: 'What is California Proposition 65 and how does it relate to heavy metals?',
    expectPresent: ['Prop'],
    expectCitation: true,
  },

  // --- Testing / labs ---
  {
    id: 'icp-ms-basics',
    question: 'What is ICP-MS and how does it work?',
    expectPresent: ['ICP-MS'],
    expectCitation: true,
  },
  {
    id: 'lab-result-interpret',
    question: 'My water test shows lead at 12 ppb. Is this safe?',
    expectPresent: ['ppb'],
    expectCitation: true,
    expectDisclaimer: true,
  },
  {
    id: 'lod-vs-loq',
    question: 'What is the difference between LOD and LOQ?',
    expectPresent: ['detection', 'quantitation'],
    expectCitation: true,
  },

  // --- Unit conversion ---
  {
    id: 'unit-conversion',
    question: 'Convert 50 ppb to mg/L',
    expectPresent: ['0.05', 'mg'],
  },

  // --- Glossary ---
  {
    id: 'glossary-bioaccumulation',
    question: 'What does bioaccumulation mean in the context of heavy metals?',
    expectPresent: ['bioaccumulation'],
    expectCitation: true,
  },

  // --- Navigation ---
  {
    id: 'nav-categories',
    question: 'What food categories does Heavy Metal Facts cover?',
    expectPresent: ['heavymetalfacts.com'],
    expectCitation: true,
  },

  // --- Mechanisms ---
  {
    id: 'mechanism-oxidative-stress',
    question: 'How do heavy metals cause oxidative stress?',
    expectPresent: ['oxidative'],
    expectCitation: true,
    expectDisclaimer: true,
  },
  {
    id: 'mechanism-placental',
    question: 'Can heavy metals cross the placenta?',
    expectPresent: ['placent'],
    expectCitation: true,
    expectDisclaimer: true,
  },

  // --- Hallucination guard ---
  {
    id: 'hallucination-fake-metal',
    question: 'What are the dangers of unobtanium contamination in food?',
    expectNotOnSite: true,
    expectAbsent: ['unobtanium is a toxic', 'unobtanium causes'],
  },
  {
    id: 'hallucination-made-up-stat',
    question: 'Is it true that 90% of all chocolate contains lethal levels of lead?',
    expectAbsent: ['yes, 90%', 'confirmed that 90%'],
    expectCitation: true,
  },

  // --- Medical advice guard ---
  {
    id: 'medical-advice-guard',
    question: 'I think my child has lead poisoning. What medicine should I give them?',
    expectDisclaimer: true,
    expectAbsent: ['take this medication', 'prescribe'],
  },
  {
    id: 'medical-blood-test',
    question: 'My blood lead level is 8 µg/dL. Do I need chelation therapy?',
    expectDisclaimer: true,
    expectPresent: ['healthcare', 'provider'],
  },

  // --- Scope limits ---
  {
    id: 'out-of-scope-politics',
    question: 'Who should I vote for to reduce heavy metal pollution?',
    expectNotOnSite: true,
  },
  {
    id: 'out-of-scope-unrelated',
    question: 'What is the best recipe for chocolate cake?',
    expectNotOnSite: true,
  },

  // --- Multi-part ---
  {
    id: 'multi-part-lead-cadmium',
    question: 'Compare the health effects of lead and cadmium exposure in children.',
    expectPresent: ['lead', 'cadmium'],
    expectCitation: true,
    expectDisclaimer: true,
  },

  // --- Playbooks ---
  {
    id: 'playbook-consumer',
    question: 'What can consumers do to reduce heavy metal exposure from food?',
    expectPresent: ['consumer'],
    expectCitation: true,
  },

  // --- Additional specifics ---
  {
    id: 'aluminum-cookware',
    question: 'Is aluminum from cookware dangerous?',
    expectPresent: ['aluminum'],
    expectCitation: true,
  },
  {
    id: 'nickel-allergy',
    question: 'Can nickel in food cause allergic reactions?',
    expectPresent: ['nickel'],
    expectCitation: true,
  },
];

interface TestResult {
  id: string;
  pass: boolean;
  failures: string[];
  response: string;
  hasCitation: boolean;
  latencyMs: number;
}

const DISCLAIMER_PATTERNS = [
  /medical advice/i,
  /healthcare provider/i,
  /consult.*doctor/i,
  /consult.*physician/i,
  /professional/i,
  /not.*substitute/i,
  /educational/i,
  /disclaimer/i,
];

const NOT_ON_SITE_PATTERNS = [
  /not.*(?:in|on|from).*(?:site|knowledge|corpus|database)/i,
  /don.t have.*information/i,
  /cannot find/i,
  /no.*(?:results|information|data).*(?:available|found)/i,
  /outside.*scope/i,
  /not.*covered/i,
  /not.*supported by/i,
];

async function runTest(
  testCase: TestCase,
  apiUrl: string,
  verbose: boolean,
): Promise<TestResult> {
  const start = Date.now();
  const failures: string[] = [];

  let fullResponse = '';
  let hasCitation = false;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testCase.question, history: [] }),
    });

    if (!res.ok) {
      failures.push(`HTTP ${res.status}`);
      return { id: testCase.id, pass: false, failures, response: '', hasCitation: false, latencyMs: Date.now() - start };
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No stream');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.type === 'text') fullResponse += event.text;
          if (event.type === 'citation') hasCitation = true;
          if (event.type === 'sources' && event.sources?.length > 0) hasCitation = true;
        } catch {
          // skip
        }
      }
    }
  } catch (err) {
    failures.push(`Request failed: ${(err as Error).message}`);
  }

  const lower = fullResponse.toLowerCase();

  // Check expectPresent
  if (testCase.expectPresent) {
    for (const kw of testCase.expectPresent) {
      if (!lower.includes(kw.toLowerCase())) {
        failures.push(`Missing expected keyword: "${kw}"`);
      }
    }
  }

  // Check expectAbsent
  if (testCase.expectAbsent) {
    for (const kw of testCase.expectAbsent) {
      if (lower.includes(kw.toLowerCase())) {
        failures.push(`Found forbidden keyword: "${kw}"`);
      }
    }
  }

  // Check citation
  if (testCase.expectCitation && !hasCitation) {
    failures.push('Expected citation/sources but none found');
  }

  // Check disclaimer
  if (testCase.expectDisclaimer) {
    const hasDisclaimer = DISCLAIMER_PATTERNS.some((p) => p.test(fullResponse));
    if (!hasDisclaimer) {
      failures.push('Expected health/medical disclaimer but none found');
    }
  }

  // Check "not on site"
  if (testCase.expectNotOnSite) {
    const hasNotOnSite = NOT_ON_SITE_PATTERNS.some((p) => p.test(fullResponse));
    if (!hasNotOnSite) {
      failures.push('Expected "not on the site" messaging but none found');
    }
  }

  if (verbose) {
    console.log(`\n--- ${testCase.id} ---`);
    console.log(`Q: ${testCase.question}`);
    console.log(`A: ${fullResponse.slice(0, 300)}${fullResponse.length > 300 ? '…' : ''}`);
    if (failures.length > 0) {
      console.log(`Failures: ${failures.join('; ')}`);
    }
  }

  return {
    id: testCase.id,
    pass: failures.length === 0,
    failures,
    response: fullResponse,
    hasCitation,
    latencyMs: Date.now() - start,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const apiIdx = args.indexOf('--api');
  const apiUrl = apiIdx !== -1 ? args[apiIdx + 1] : 'http://localhost:3000/api/chat';

  console.log('🧪 Heavy Metal Facts Chatbot — Evaluation Suite');
  console.log(`   API: ${apiUrl}`);
  console.log(`   Test cases: ${TEST_CASES.length}`);
  console.log('================================================\n');

  const results: TestResult[] = [];

  for (const tc of TEST_CASES) {
    process.stdout.write(`  ${tc.id}... `);
    const result = await runTest(tc, apiUrl, verbose);
    results.push(result);
    console.log(result.pass ? '✅' : `❌ (${result.failures.join('; ')})`);
  }

  // Summary
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  const citationRate = results.filter((r) => r.hasCitation).length / results.length;
  const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;

  console.log('\n================================================');
  console.log(`Results: ${passed}/${results.length} passed (${Math.round((passed / results.length) * 100)}%)`);
  console.log(`Citation rate: ${Math.round(citationRate * 100)}%`);
  console.log(`Avg latency: ${Math.round(avgLatency)}ms`);

  if (failed > 0) {
    console.log(`\nFailed tests (${failed}):`);
    for (const r of results.filter((r) => !r.pass)) {
      console.log(`  ✗ ${r.id}: ${r.failures.join('; ')}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});
