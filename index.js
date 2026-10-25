import { appendFileSync } from 'node:fs';

const payloadText = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

const fail = (message) => {
  throw new Error(message);
};

if (typeof payloadText !== 'string') fail('INPUT_PAYLOAD must be set');
if (typeof outputPath !== 'string' || outputPath.length === 0) fail('GITHUB_OUTPUT must be set');

let parsed;
try {
  parsed = JSON.parse(payloadText);
} catch {
  fail('INPUT_PAYLOAD must be valid JSON');
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  fail('payload must be an object');
}
if (!Object.prototype.hasOwnProperty.call(parsed, 'value') || !Object.prototype.hasOwnProperty.call(parsed, 'required')) {
  fail('payload must contain value and required');
}

const { value, required } = parsed;

if (value === null || typeof value !== 'object' || Array.isArray(value)) {
  fail('value must be a plain object');
}
if (Object.getPrototypeOf(value) !== Object.prototype) {
  fail('value must be a plain object');
}
if (!Array.isArray(required)) {
  fail('required must be an array');
}

const seen = new Set();
for (let i = 0; i < required.length; i += 1) {
  const k = required[i];
  if (typeof k !== 'string' || k.length === 0) fail('required must contain non-empty strings');
  if (seen.has(k)) fail('required must contain unique strings');
  seen.add(k);
}

const present = [];
const missing = [];

for (let i = 0; i < required.length; i += 1) {
  const k = required[i];
  if (Object.prototype.hasOwnProperty.call(value, k)) present.push(k);
  else missing.push(k);
}

present.sort();
missing.sort();

const result = {
  missing,
  ok: missing.length === 0,
  present
};

appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);