
import { test } from 'node:test';
import assert from 'node:assert';
import { calculateStreak } from '../utils/recovery.ts';

test('streak calculation: empty history', () => {
  assert.strictEqual(calculateStreak([]), 0);
});

test('streak calculation: single entry', () => {
  assert.strictEqual(calculateStreak([{ date: '2023-10-27' }]), 1);
});

test('streak calculation: consecutive days', () => {
  const history = [
    { date: '2023-10-27' },
    { date: '2023-10-26' },
    { date: '2023-10-25' },
  ];
  assert.strictEqual(calculateStreak(history), 3);
});

test('streak calculation: unsorted consecutive days', () => {
  const history = [
    { date: '2023-10-25' },
    { date: '2023-10-27' },
    { date: '2023-10-26' },
  ];
  assert.strictEqual(calculateStreak(history), 3);
});

test('streak calculation: gap in days', () => {
  const history = [
    { date: '2023-10-27' },
    { date: '2023-10-26' },
    { date: '2023-10-24' },
  ];
  assert.strictEqual(calculateStreak(history), 2);
});

test('streak calculation: duplicate dates', () => {
  const history = [
    { date: '2023-10-27' },
    { date: '2023-10-27' },
    { date: '2023-10-26' },
  ];
  assert.strictEqual(calculateStreak(history), 2);
});
