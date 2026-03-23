import test from "node:test";
import assert from "node:assert";
import Database from "better-sqlite3";
import { initializeDatabase } from "./server.ts";

test("initializeDatabase creates tables and seeds default affirmations", () => {
  // Use in-memory database for isolation
  const db = new Database(":memory:");

  // Initialize
  initializeDatabase(db);

  // Check tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('focus_sessions', 'affirmations')").all() as { name: string }[];
  assert.strictEqual(tables.length, 2, "Should create both focus_sessions and affirmations tables");

  const tableNames = tables.map(t => t.name);
  assert.ok(tableNames.includes("focus_sessions"));
  assert.ok(tableNames.includes("affirmations"));

  // Check default affirmations are seeded
  const affirmations = db.prepare("SELECT * FROM affirmations").all() as { text: string, is_custom: number }[];
  assert.strictEqual(affirmations.length, 6, "Should seed exactly 6 default affirmations");

  // Verify one of the default affirmations
  assert.strictEqual(affirmations[0].text, "I am capable of achieving my goals.");
  assert.strictEqual(affirmations[0].is_custom, 0, "Default affirmations should not be custom");

  // Call again to verify it doesn't seed duplicates
  initializeDatabase(db);
  const affirmationsAfterSecondInit = db.prepare("SELECT COUNT(*) as count FROM affirmations").get() as { count: number };
  assert.strictEqual(affirmationsAfterSecondInit.count, 6, "Should not duplicate affirmations on second initialization");
});
