import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'backend',
      root: './tests/backend',
      environment: 'node',
      include: ['**/*.test.js'],
    },
  },
  {
    test: {
      name: 'frontend',
      root: './tests/frontend',
      environment: 'happy-dom',
      include: ['**/*.test.js'],
    },
  },
]);
