import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app, db } from './server.ts';

describe('GET /api/sessions', () => {
  beforeEach(() => {
    // Clear the sessions table before each test to ensure a clean slate
    db.prepare('DELETE FROM focus_sessions').run();
  });

  after(() => {
    db.close();
  });

  test('should return an empty array when there are no sessions', async () => {
    const response = await request(app).get('/api/sessions');
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, []);
  });

  test('should return all focus sessions sorted by completed_at descending', async () => {
    const stmt = db.prepare('INSERT INTO focus_sessions (duration, task_name, completed_at) VALUES (?, ?, ?)');
    stmt.run(25, 'Task A', '2023-01-01 10:00:00');
    stmt.run(50, 'Task B', '2023-01-02 10:00:00');
    stmt.run(10, 'Task C', '2023-01-01 12:00:00');

    const response = await request(app).get('/api/sessions');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, 3);

    // Task B is most recent
    assert.strictEqual(response.body[0].task_name, 'Task B');
    assert.strictEqual(response.body[0].duration, 50);

    // Task C is next most recent
    assert.strictEqual(response.body[1].task_name, 'Task C');
    assert.strictEqual(response.body[1].duration, 10);

    // Task A is oldest
    assert.strictEqual(response.body[2].task_name, 'Task A');
    assert.strictEqual(response.body[2].duration, 25);
  });

  test('should return a maximum of 50 sessions', async () => {
    const stmt = db.prepare('INSERT INTO focus_sessions (duration, task_name) VALUES (?, ?)');
    for (let i = 0; i < 55; i++) {
      stmt.run(25, `Task ${i}`);
    }

    const response = await request(app).get('/api/sessions');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, 50);
  });
});
