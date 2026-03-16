import { test } from 'node:test';
import assert from 'node:assert';
import { formatTime } from './format.ts';

test('formatTime correctly formats seconds into MM:SS', () => {
  assert.strictEqual(formatTime(0), '00:00', '0 seconds should be 00:00');
  assert.strictEqual(formatTime(5), '00:05', '5 seconds should be 00:05');
  assert.strictEqual(formatTime(59), '00:59', '59 seconds should be 00:59');
  assert.strictEqual(formatTime(60), '01:00', '60 seconds should be 01:00');
  assert.strictEqual(formatTime(61), '01:01', '61 seconds should be 01:01');
  assert.strictEqual(formatTime(600), '10:00', '600 seconds should be 10:00');
  assert.strictEqual(formatTime(3599), '59:59', '3599 seconds should be 59:59');
  assert.strictEqual(formatTime(3600), '60:00', '3600 seconds should be 60:00');
});
