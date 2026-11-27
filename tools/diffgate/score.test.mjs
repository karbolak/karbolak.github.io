import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { scoreFeatures } from './score.mjs';

const examples = JSON.parse(readFileSync(new URL('./examples.json', import.meta.url), 'utf8'));
for (const { label, features, cli } of examples) {
  test(label, () => assert.ok(Math.abs(scoreFeatures(features) - cli.health_score) < 1e-12));
}
