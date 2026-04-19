# @sora-soft/typia-decorator

AOT (compile-time) parameter type validation via `@guard` decorator, powered by [typia](https://typia.io).

## Installation

```bash
pnpm add @sora-soft/typia-decorator typia
```

## Setup

Add the transformer to your `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "plugins": [
      { "transform": "@sora-soft/typia-decorator/transform" },
      { "transform": "typia/lib/transform" },
    ]
  }
}
```

> The `typia` transformer must be listed **before** `@sora-soft/typia-decorator/transform` so that the injected `typia.assert()` calls are further processed by typia.

Use `ts-patch` or `ttypescript` to compile:

```bash
# With ts-patch (recommended)
npx ts-patch install
tsc

# Or with ttypescript
npx ttsc
```

## Usage

```typescript
import { guard } from '@sora-soft/typia-decorator';

interface UserInput {
  name: string;
  age: number & tags.Type<"uint32">;
}

class UserService {
  greet(@guard input: UserInput) {
    // input is already validated at this point
    return `Hello, ${input.name}! You are ${input.age} years old.`;
  }

  compute(@guard a: number, @guard b: number) {
    return a + b;
  }
}
```

After compilation, the transformer rewrites the methods to:

```typescript
class UserService {
  greet(input) {
    typia.assert(input);
    return `Hello, ${input.name}! You are ${input.age} years old.`;
  }

  compute(a, b) {
    typia.assert(a);
    typia.assert(b);
    return a + b;
  }
}
```

The `@guard` decorator is erased from the output, and `typia.assert<T>(param)` is injected at the top of each method body. The typia transformer then replaces these calls with optimized validation code.

## How It Works

1. **Runtime**: The `guard` function is an empty parameter decorator, used only as an AST marker.
2. **Transform**: The TypeScript AST transformer:
   - Scans all method declarations for `@guard` decorated parameters
   - Uses `TypeChecker` Symbol resolution to verify the decorator comes from `@sora-soft/typia-decorator/runtime` (prevents false positives from same-named decorators)
   - Injects `typia.assert<Type>(paramName)` at the top of the method body
   - Removes the `@guard` decorator from the output

## API

### `guard` (Parameter Decorator)

```typescript
import { guard } from '@sora-soft/typia-decorator';
// or
import { guard } from '@sora-soft/typia-decorator/runtime';
```

A no-op parameter decorator. Use it to mark method parameters for compile-time validation.
