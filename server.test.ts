import test from "node:test";
import assert from "node:assert";
import request from "supertest";

// Set environment variable to 'test' BEFORE importing the app
process.env.NODE_ENV = "test";

// We need to use dynamic imports to ensure the env var is set before module evaluation
const { app, setupApp, db } = await import("./server.ts");

test("DELETE /api/affirmations/:id", async (t) => {
  // Wait for setupApp to configure the Express middlewares
  await setupApp();

  await t.test("successfully deletes an existing affirmation", async () => {
    // 1. Insert a test affirmation
    const insertResult = db.prepare("INSERT INTO affirmations (text, is_custom) VALUES (?, ?)").run("Test Affirmation", 1);
    const id = insertResult.lastInsertRowid;

    // 2. Make sure it exists
    const beforeCount = db.prepare("SELECT COUNT(*) as count FROM affirmations WHERE id = ?").get(id) as { count: number };
    assert.strictEqual(beforeCount.count, 1);

    // 3. Make the DELETE request
    const response = await request(app).delete(`/api/affirmations/${id}`);

    // 4. Assert response
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, { success: true });

    // 5. Assert it's removed from DB
    const afterCount = db.prepare("SELECT COUNT(*) as count FROM affirmations WHERE id = ?").get(id) as { count: number };
    assert.strictEqual(afterCount.count, 0);
  });

  await t.test("returns success even if ID does not exist", async () => {
    // Pick an ID that definitely does not exist
    const nonExistentId = 999999;

    // Ensure it doesn't exist
    const beforeCount = db.prepare("SELECT COUNT(*) as count FROM affirmations WHERE id = ?").get(nonExistentId) as { count: number };
    assert.strictEqual(beforeCount.count, 0);

    // Make the DELETE request
    const response = await request(app).delete(`/api/affirmations/${nonExistentId}`);

    // Assert response - current behavior is to return 200 { success: true }
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, { success: true });
  });
});
