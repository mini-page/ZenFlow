import { test } from 'node:test';
import assert from 'node:assert';
import { NAV_GROUPS, NAV_ITEMS } from './navigation.ts';

test('NAV_GROUPS contains expected values', () => {
  const expectedGroups = ['Core', 'Wellness', 'Tools'];
  assert.strictEqual(NAV_GROUPS.length, expectedGroups.length, 'NAV_GROUPS should have 3 items');
  expectedGroups.forEach(group => {
    assert.ok(NAV_GROUPS.includes(group as any), `NAV_GROUPS should include ${group}`);
  });
});

test('NAV_GROUPS has no duplicates', () => {
  const uniqueGroups = new Set(NAV_GROUPS);
  assert.strictEqual(uniqueGroups.size, NAV_GROUPS.length, 'NAV_GROUPS should not have duplicate values');
});

test('All NAV_ITEMS belong to a valid group', () => {
  assert.ok(NAV_ITEMS.length > 0, 'NAV_ITEMS should not be empty');
  NAV_ITEMS.forEach(item => {
    assert.ok(NAV_GROUPS.includes(item.group), `Item ${item.view} has invalid group: ${item.group}`);
  });
});
