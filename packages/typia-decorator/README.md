# @sora-soft/typia-decorator

基于 `@guard` 装饰器的 AOT（编译时）参数类型验证，由 [typia](https://typia.io) 核心库驱动。

## 安装

```bash
pnpm add @sora-soft/typia-decorator typia
```

## 配置

将 transformer 添加到 `tsconfig.json`：

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

> `typia` transformer 必须列在 `@sora-soft/typia-decorator/transform` **之后**。`typia-decorator` 先通过 `@typia/core` 的 `AssertProgrammer` 直接生成类型验证代码并注入方法体，typia transformer 再处理生成的代码中的 typia 相关引用。

使用 `ts-patch` 或 `ttypescript` 编译：

```bash
# 使用 ts-patch（推荐）
npx ts-patch install
tsc

# 或使用 ttypescript
npx ttsc
```

## 使用方法

```typescript
import { guard } from '@sora-soft/typia-decorator';

interface UserInput {
  name: string;
  age: number & tags.Type<"uint32">;
}

class UserService {
  greet(@guard input: UserInput) {
    // input 在此处已完成验证
    return `Hello, ${input.name}! You are ${input.age} years old.`;
  }

  compute(@guard a: number, @guard b: number) {
    return a + b;
  }
}
```

编译后，transformer 会通过 `@typia/core` 的 `AssertProgrammer` 直接生成针对参数类型的验证代码，注入到方法体顶部，并擦除 `@guard` 装饰器。生成的验证代码为高性能的内联类型检查逻辑，不依赖运行时 `typia.assert()` 调用。

## 工作原理

编译过程分为两个 transformer 阶段：

1. **`typia-decorator/transform`（先执行）**：
   - 扫描源码中所有带 `@guard` 装饰器的方法参数
   - 通过 `@typia/core` 的 `AssertProgrammer.write()` 根据参数类型直接生成验证代码
   - 将验证代码注入到方法体顶部
   - 从输出中擦除 `@guard` 装饰器
   - 通过 `ImportProgrammer` 自动添加必要的 import 语句

2. **`typia/lib/transform`（后执行）**：处理上一阶段生成的 typia 相关引用。

### 符号追踪

transformer **不会**通过字符串匹配 `"guard"` 来识别装饰器，而是通过 `TypeChecker` Symbol 解析追踪装饰器的来源：

- 沿别名链（`import { guard }` → `export { guard }` → 源文件）追踪至声明处
- 验证声明文件路径以 `runtime/index.d.ts` 结尾
- 只有确认来自 `@sora-soft/typia-decorator/runtime` 的 `guard` 才会被处理，避免同名装饰器误判

### 约束

- **仅作用于方法声明**（`MethodDeclaration`），不支持构造函数、箭头函数或普通函数
- **参数必须有显式类型注解**，无类型注解的参数会被静默跳过
- **支持多参数校验**，同一方法中多个参数可分别使用 `@guard`

## API

### `guard`（参数装饰器）

```typescript
import { guard } from '@sora-soft/typia-decorator';
// 或
import { guard } from '@sora-soft/typia-decorator/runtime';
```

空的参数装饰器，运行时不执行任何逻辑，仅作为编译时 AST 标记。`@guard` 标记的参数在编译后会自动生成类型校验代码。

### `transform`（Transformer 插件）

```typescript
import transformer from '@sora-soft/typia-decorator/transform';
```

TypeScript `TransformerFactory<SourceFile>`，在 `tsconfig.json` 的 `plugins` 中配置，不应直接调用。
