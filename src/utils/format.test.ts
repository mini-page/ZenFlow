import { test } from 'node:test';
import assert from 'node:assert';
import { formatTime } from './format.ts';

test('formatTime utility', async (t) => {
  await t.test('formats 0 seconds correctly', () => {
    assert.strictEqual(formatTime(0), '00:00');
  });

  await t.test('formats seconds under 10 correctly', () => {
    assert.strictEqual(formatTime(5), '00:05');
  });

  await t.test('formats seconds over 10 correctly', () => {
    assert.strictEqual(formatTime(15), '00:15');
  });

  await t.test('formats exactly one minute correctly', () => {
    assert.strictEqual(formatTime(60), '01:00');
  });

  await t.test('formats minutes and seconds correctly', () => {
    assert.strictEqual(formatTime(75), '01:15');
  });

  await t.test('formats large number of minutes correctly', () => {
    assert.strictEqual(formatTime(3600), '60:00');
    assert.strictEqual(formatTime(3661), '61:01');
  });

  await t.test('handles non-integer seconds correctly', () => {
    assert.strictEqual(formatTime(65.7), '01:05');
  });

  await t.test('handles negative seconds by clamping to zero', () => {
    assert.strictEqual(formatTime(-30), '00:00');
  });
});
