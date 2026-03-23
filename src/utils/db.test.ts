import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { ZenDB } from './db.ts';

describe('ZenDB', () => {
  let db: ZenDB;

  beforeEach(() => {
    db = new ZenDB();

    // Mock the global scope for IndexedDB
    global.indexedDB = {
      open: mock.fn(),
    } as any;
  });

  afterEach(() => {
    mock.restoreAll();
  });

  describe('deleteSound', () => {
    it('should successfully delete a sound by id', async () => {
      const mockRequest: any = {
        onsuccess: null,
        onerror: null,
        result: null,
      };

      const mockStoreRequest: any = {
        onsuccess: null,
        onerror: null,
        error: null,
      };

      const mockStore = {
        delete: mock.fn((id: string) => {
          setTimeout(() => {
            if (mockStoreRequest.onsuccess) mockStoreRequest.onsuccess();
          }, 0);
          return mockStoreRequest;
        }),
      };

      const mockTransaction = {
        objectStore: mock.fn((name: string) => mockStore),
      };

      const mockDB = {
        transaction: mock.fn((storeName: string, mode: string) => mockTransaction),
        objectStoreNames: {
          contains: mock.fn(() => true),
        },
      };

      // Re-assign the mock directly instead of using mockImplementation
      global.indexedDB.open = mock.fn(() => {
        setTimeout(() => {
          mockRequest.result = mockDB;
          if (mockRequest.onsuccess) mockRequest.onsuccess();
        }, 0);
        return mockRequest;
      });

      // Call the method
      await db.deleteSound('sound-123');

      // Assertions
      assert.strictEqual((global.indexedDB.open as any).mock.callCount(), 1);
      assert.strictEqual(mockDB.transaction.mock.callCount(), 1);
      assert.strictEqual(mockDB.transaction.mock.calls[0].arguments[0], 'customSounds');
      assert.strictEqual(mockDB.transaction.mock.calls[0].arguments[1], 'readwrite');

      assert.strictEqual(mockTransaction.objectStore.mock.callCount(), 1);
      assert.strictEqual(mockTransaction.objectStore.mock.calls[0].arguments[0], 'customSounds');

      assert.strictEqual(mockStore.delete.mock.callCount(), 1);
      assert.strictEqual(mockStore.delete.mock.calls[0].arguments[0], 'sound-123');
    });

    it('should reject when the delete request encounters an error', async () => {
      const mockRequest: any = {
        onsuccess: null,
        onerror: null,
        result: null,
      };

      const mockError = new Error('Failed to delete sound');
      const mockStoreRequest: any = {
        onsuccess: null,
        onerror: null,
        error: mockError,
      };

      const mockStore = {
        delete: mock.fn((id: string) => {
          setTimeout(() => {
            if (mockStoreRequest.onerror) mockStoreRequest.onerror();
          }, 0);
          return mockStoreRequest;
        }),
      };

      const mockTransaction = {
        objectStore: mock.fn((name: string) => mockStore),
      };

      const mockDB = {
        transaction: mock.fn((storeName: string, mode: string) => mockTransaction),
        objectStoreNames: {
          contains: mock.fn(() => true),
        },
      };

      // Re-assign the mock directly instead of using mockImplementation
      global.indexedDB.open = mock.fn(() => {
        setTimeout(() => {
          mockRequest.result = mockDB;
          if (mockRequest.onsuccess) mockRequest.onsuccess();
        }, 0);
        return mockRequest;
      });

      // Call the method and expect rejection
      await assert.rejects(
        () => db.deleteSound('sound-456'),
        mockError
      );

      // Assertions to ensure it reached the correct state before rejecting
      assert.strictEqual(mockStore.delete.mock.callCount(), 1);
      assert.strictEqual(mockStore.delete.mock.calls[0].arguments[0], 'sound-456');
    });
  });
});
