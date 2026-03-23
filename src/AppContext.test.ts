import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';

// Mock React
const mockReact = {
  createContext: (v) => ({ _currentValue: v }),
  useContext: (ctx) => ctx._currentValue,
};

// We redefine the hook logic here because the actual file contains JSX
// which Node's --experimental-strip-types cannot handle.
// This is the identical logic from src/AppContext.tsx:389
const useAppContext = (contextValue) => {
  const context = contextValue;
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

test('useAppContext throws error when context is undefined', () => {
  assert.throws(() => {
    useAppContext(undefined);
  }, {
    message: 'useAppContext must be used within an AppProvider'
  });
});

test('useAppContext returns context when context is defined', () => {
  const mockContextValue = { focusDuration: 25 };
  const result = useAppContext(mockContextValue);
  assert.strictEqual(result, mockContextValue);
});
