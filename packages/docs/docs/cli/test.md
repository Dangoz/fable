---
sidebar_position: 6
title: Test Command
description: Run and manage tests for ElizaOS projects and plugins
keywords: [testing, unit tests, integration tests, Jest, test runner, development]
image: /img/cli.jpg
---

# Test Command

The `test` command allows you to run tests for your ElizaOS projects, plugins, and agents. It helps ensure your implementations work correctly before deployment.

## Usage

```bash
elizaos test [options]
```

## Options

| Option                       | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `-p, --port <port>`          | Port to listen on for the test server                 |
| `-pl, --plugin <name>`       | Filter tests to run only for a specific plugin        |
| `-sp, --skip-plugins`        | Skip running tests defined within plugins             |
| `-spt, --skip-project-tests` | Skip running project-level tests                      |
| `-sb, --skip-build`          | Skip building the project/plugin before running tests |

## Test Structure

ElizaOS tests are organized in three levels:

1. **Test Files**: Physical files containing test suites
2. **Test Suites**: Groups of related tests with a unique name
3. **Tests**: Individual test cases that verify specific functionality

Tests are defined in plugins or projects using a structured format:

```typescript
// Example test structure from a plugin
const tests = [
  {
    name: 'plugin_test_suite',
    tests: [
      {
        name: 'example_test',
        fn: async (runtime) => {
          // Test implementation
          if (runtime.character.name !== 'Eliza') {
            throw new Error('Expected character name to be "Eliza"');
          }
        },
      },
      {
        name: 'should_have_action',
        fn: async (runtime) => {
          // Another test
          const actionExists = plugin.actions.some((a) => a.name === 'EXAMPLE_ACTION');
          if (!actionExists) {
            throw new Error('Example action not found in plugin');
          }
        },
      },
    ],
  },
];
```

## Running Tests

### Basic Test Execution

Run all tests in the current project:

```bash
# Navigate to your project
cd my-agent-project

# Run all tests
elizaos test
```

### Running Specific Tests

Filter tests by plugin or skip certain test types:

```bash
# Run only tests for 'my-custom-plugin'
elizaos test -pl my-custom-plugin

# Run project tests but skip all plugin tests
elizaos test -sp

# Run plugin tests but skip all project tests
elizaos test -spt
```

## Test Output

The test command produces output showing test results:

```
PASS  Test Suite: plugin_test_suite (2 tests)
  ✓ example_test (15ms)
  ✓ should_have_action (3ms)

FAIL  Test Suite: agent_test_suite (3 tests)
  ✓ agent_initialization (20ms)
  ✓ message_processing (45ms)
  ✗ knowledge_retrieval (30ms)
    Error: Expected 3 knowledge items but got 2

Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 failed, 4 passed, 5 total
Time:        1.5s
```

## Writing Tests

### Project Tests

Project tests typically verify agent behavior, knowledge retrieval, and integration with plugins:

```typescript
// Example project test
export default {
  name: 'agent_behavior_tests',
  tests: [
    {
      name: 'responds_to_greeting',
      fn: async (runtime) => {
        const agent = runtime.getAgent('assistant');
        const response = await agent.processMessage({
          content: { text: 'Hello' },
          userId: 'test-user',
        });

        if (!response.content.text.includes('hello') && !response.content.text.includes('Hi')) {
          throw new Error('Agent did not respond to greeting properly');
        }
      },
    },
  ],
};
```

### Plugin Tests

Plugin tests verify the functionality of actions, services, and providers:

```typescript
// Example plugin test
export const testSuite = {
  name: 'discord_plugin_tests',
  tests: [
    {
      name: 'registers_discord_service',
      fn: async (runtime) => {
        const service = runtime.getService('discord');
        if (!service) {
          throw new Error('Discord service not registered');
        }
      },
    },
    {
      name: 'handles_discord_messages',
      fn: async (runtime) => {
        // Test implementation
      },
    },
  ],
};
```

## Test Hooks

ElizaOS tests support hooks for setup and teardown:

```typescript
export default {
  name: 'database_tests',
  beforeAll: async (runtime) => {
    // Setup test database
    await runtime.db.migrate();
  },
  afterAll: async (runtime) => {
    // Clean up test database
    await runtime.db.clean();
  },
  beforeEach: async (runtime, test) => {
    // Setup before each test
    console.log(`Running test: ${test.name}`);
  },
  afterEach: async (runtime, test) => {
    // Cleanup after each test
  },
  tests: [
    // Test cases
  ],
};
```

## Test Assertions

Tests should make assertions to verify behavior:

```typescript
test('check_knowledge_retrieval', async (runtime) => {
  const query = 'What is our refund policy?';
  const results = await runtime.knowledge.search(query);

  // Check count
  if (results.length === 0) {
    throw new Error('No knowledge results found');
  }

  // Check relevance
  if (!results[0].text.includes('refund') && !results[0].text.includes('return')) {
    throw new Error('Knowledge results not relevant to query');
  }
});
```

## Examples

### Testing a Complete Project

```bash
# Run all tests
elizaos test
```

### CI/CD Integration

```bash
# Run tests in CI environment
elizaos test
```

## Troubleshooting

### Tests not found

If tests aren't being discovered:

```bash
# Check test discovery with verbose logging
elizaos test --dry-run --verbose

# Try specifying the test file directly
elizaos test --file src/tests/main.test.ts
```

### Tests timing out

For long-running tests:

```bash
# Increase test timeout (not applicable)
```

### TypeScript errors

If TypeScript compilation is failing:

```bash
# Build the project first
elizaos project build

# Then run tests without recompilation (not applicable)
```

## Related Commands

- [`dev`](./dev.md): Run your project in development mode
- [`start`](./start.md): Start your project in production mode
