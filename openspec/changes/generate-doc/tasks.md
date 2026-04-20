## 1. 基础设施

- [ ] 1.1 在 `packages/sora-cli/package.json` 中添加 `js-yaml` 及 `@types/js-yaml` 依赖
- [ ] 1.2 在 `packages/sora-cli/src/lib/exporter/jsdoc-utils.ts` 的 `SORA_TAGS` 集合中添加 `soraPrefix` 和 `method`
- [ ] 1.3 在 `packages/sora-cli/src/lib/exporter/annotation-reader.ts` 中新增 `readPrefix(node)` 和 `readHttpMethod(node)` 静态方法
- [ ] 1.4 创建 `packages/sora-cli/src/lib/doc/` 目录

## 2. 核心管线模块

- [ ] 2.1 实现 `src/lib/doc/doc-collector.ts`：基于现有 Collector 扩展，在收集 route 类时同时读取 `@soraPrefix` 注解，返回带 prefix 信息的 `DocExportPlan`
- [ ] 2.2 实现 `src/lib/doc/doc-transformer.ts`：遍历 route 类的 `@Route.method` 方法，读取 `@description`、`@method`、`@soraIgnore`，提取第一个参数类型和返回类型，生成 OpenAPI PathItem 结构
- [ ] 2.3 实现 `src/lib/doc/schema-resolver.ts`：基于 TypeChecker 递归遍历 TypeScript 类型，转换为 JSON Schema。支持 interface→object、enum→enum、Array→array、Record→additionalProperties、union→oneOf、optional→非 required、Promise 解包。命名类型提取到 schemas 集合，匿名类型 inline
- [ ] 2.4 实现 `src/lib/doc/openapi-emitter.ts`：组装完整 OpenAPI 3.0 对象（info 从 package.json 读取，paths 合并所有 route 类，components/schemas 收集所有命名类型），输出 YAML 或 JSON

## 3. 命令入口

- [ ] 3.1 创建 `src/commands/generate/doc.ts`：`sora generate:doc` 命令，接受 `--format yaml|json`（默认 yaml）和 `--target` 参数，读取 `sora.json` 的 `docOutput` 字段，串联整个管线

## 4. 配置与集成

- [ ] 4.1 更新 Config 类（`src/lib/Config.ts`）支持读取 `sora.json` 中新增的 `docOutput` 字段
- [ ] 4.2 在 `apps/example/sora.json` 中添加 `docOutput` 配置示例

## 5. 验证

- [ ] 5.1 在 example 项目中运行 `sora generate:doc`，验证 YAML 输出包含 AuthHandler 的所有 `@Route.method` 方法的正确路径、schema 和描述
- [ ] 5.2 运行 `sora generate:doc --format json`，验证 JSON 输出格式正确
- [ ] 5.3 运行 `sora generate:doc --target admin`，验证 `@soraTargets web` 的 AuthHandler 不出现在输出中
- [ ] 5.4 验证 `@soraIgnore` 标注的方法不出现在文档中
- [ ] 5.5 确认现有 `export:api` 命令不受影响（回归测试）
