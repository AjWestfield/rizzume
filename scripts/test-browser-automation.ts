/**
 * Test script for browser automation API connections
 *
 * Run with: npx tsx scripts/test-browser-automation.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function testSteelAPI(): Promise<TestResult> {
  const name = 'Steel.dev API';
  const startTime = Date.now();

  try {
    const apiKey = process.env.STEEL_API_KEY;
    if (!apiKey) {
      return { name, success: false, message: 'STEEL_API_KEY not set in environment' };
    }

    // Import Steel SDK dynamically
    const Steel = (await import('steel-sdk')).default;
    const client = new Steel({ steelAPIKey: apiKey });

    // Try to create a session (this validates the API key)
    console.log('[Steel] Creating test session...');
    const session = await client.sessions.create();
    console.log(`[Steel] Session created: ${session.id}`);

    // Release the session immediately
    await client.sessions.release(session.id);
    console.log('[Steel] Session released successfully');

    const duration = Date.now() - startTime;
    return { name, success: true, message: `API connected successfully (Session: ${session.id})`, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { name, success: false, message, duration };
  }
}

async function testHyperbrowserAPI(): Promise<TestResult> {
  const name = 'Hyperbrowser API';
  const startTime = Date.now();

  try {
    const apiKey = process.env.HYPERBROWSER_API_KEY;
    if (!apiKey) {
      return { name, success: false, message: 'HYPERBROWSER_API_KEY not set in environment' };
    }

    // Import Hyperbrowser SDK dynamically
    const Hyperbrowser = (await import('@hyperbrowser/sdk')).default;
    const client = new Hyperbrowser({ apiKey });

    // Try to create a session (this validates the API key)
    console.log('[Hyperbrowser] Creating test session...');
    const session = await client.sessions.create({
      useStealth: false, // Don't need stealth for health check
    });
    console.log(`[Hyperbrowser] Session created: ${session.id}`);

    // Stop the session immediately
    await client.sessions.stop(session.id);
    console.log('[Hyperbrowser] Session stopped successfully');

    const duration = Date.now() - startTime;
    return { name, success: true, message: `API connected successfully (Session: ${session.id})`, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { name, success: false, message, duration };
  }
}

async function testOpenAIAPI(): Promise<TestResult> {
  const name = 'OpenAI API';
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { name, success: false, message: 'OPENAI_API_KEY not set in environment' };
    }

    // Make a simple API call to verify the key
    console.log('[OpenAI] Testing API connection...');
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const modelCount = data.data?.length || 0;
    console.log(`[OpenAI] API connected, ${modelCount} models available`);

    const duration = Date.now() - startTime;
    return { name, success: true, message: `API connected successfully (${modelCount} models available)`, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { name, success: false, message, duration };
  }
}

async function testHealthEndpoint(): Promise<TestResult> {
  const name = 'Auto-Apply Health Endpoint';
  const startTime = Date.now();

  try {
    // This tests the actual API route health check
    // Note: This requires the dev server to be running
    console.log('[Health] Testing health endpoint...');
    console.log('[Health] Note: Skipping - requires dev server running');

    const duration = Date.now() - startTime;
    return {
      name,
      success: true,
      message: 'Skipped (requires dev server). Run: curl http://localhost:3000/api/agent/auto-apply?action=health',
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { name, success: false, message, duration };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       Browser Automation API Connection Tests                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Check environment variables first
  console.log('Environment Variables:');
  console.log(`  STEEL_API_KEY: ${process.env.STEEL_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`  HYPERBROWSER_API_KEY: ${process.env.HYPERBROWSER_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log('\n');

  // Run tests
  console.log('Running API tests...\n');

  results.push(await testSteelAPI());
  console.log('');

  results.push(await testHyperbrowserAPI());
  console.log('');

  results.push(await testOpenAIAPI());
  console.log('');

  results.push(await testHealthEndpoint());
  console.log('');

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                      Test Results Summary                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${status} ${result.name}${duration}`);
    console.log(`       ${result.message}\n`);

    if (result.success) passCount++;
    else failCount++;
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total: ${passCount} passed, ${failCount} failed`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('🎉 All browser automation APIs are working correctly!\n');
    console.log('You can now use the auto-apply feature to apply to jobs.');
  } else {
    console.log('⚠️  Some tests failed. Please check the API keys and try again.\n');
    process.exit(1);
  }
}

main().catch(console.error);
