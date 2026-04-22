## 1. 类型定义与接口

- [x] 1.1 在 `packages/sora-cli/src/lib/` 下新建 `ComponentInstallerTypes.ts`，定义 `ComponentInstallContext`、`InstallQuestion`、`ComponentInfo`、`ConfigTemplateEntry`、`InstallHelpers`（interface）、`ComponentInstallScript` 接口

## 2. InstallHelpers 实现

- [x] 2.1 在 `packages/sora-cli/src/lib/` 下新建 `InstallHelpers.ts`，实现 `InstallHelpers` 类。构造函数接受 `FileTree`、`Config`（soraConfig）参数
- [x] 2.2 实现 `addComponentToCom(info)` 方法：读取 Com.ts 文件，使用 `CodeInserter` 依次执行 addImport、insertEnum、insertStaticField、insertRegisterCall
- [x] 2.3 实现 `mergeJSON(targetPath, data)` 方法：读取目标 JSON 文件，deep merge，冲突字段 warn 并保留原值
- [x] 2.4 实现 `appendToConfigTemplate(entry)` 方法：调用 `ConfigTemplateInserter` 的 define 追加和 section 追加逻辑
- [x] 2.5 实现 `copyFile`、`writeFile`、`ensureDir` 文件操作方法，全部通过 FileTree 执行
- [x] 2.6 实现 `camelize`、`dashlize` 工具方法，委托到现有 `Utility`
- [x] 2.7 实现 `log`、`warn` 输出方法

## 3. ConfigTemplateInserter 扩展

- [x] 3.1 将 `checkDuplicate` 的 section 参数类型从 `'services' | 'workers'` 扩展为 `string`
- [x] 3.2 新增 `appendDefines(content, newDefines)` 静态方法：提取已有 defineKeys，追加不重复的新 defines
- [x] 3.3 新增 `appendToConfigTemplate(templatePath, entry, log)` 静态方法：组合 define 追加 + section 追加 + 写入

## 4. CodeInserter 扩展

- [x] 4.1 新增 `insertStaticField(className, fieldName, expression)` 方法：在 class 中添加 static 字段声明
- [x] 4.2 验证现有 `insertEnum`、`addImport`、`insertCodeInClassMethod` 满足 addComponentToCom 的需求

## 5. add:component 命令

- [x] 5.1 在 `packages/sora-cli/src/commands/add/` 下新建 `component.ts`，创建 `AddComponent` 命令类，继承 `BaseCommand`
- [x] 5.2 实现 `requiredConfigFields()`：要求 `root`、`componentNameEnum`（path#name）、`comClass`（path#class.method）
- [x] 5.3 实现 Phase 0：接受 `<package>` 参数，执行 `npm install --save <package>`
- [x] 5.4 实现 Phase 1：从 `node_modules` 读取 `sora-component.json`，动态 import install script，校验 `prepare` 和 `action` 导出
- [x] 5.5 实现重复安装检测：读取 Com.ts 检查是否已包含该包的 import
- [x] 5.6 实现 Phase 2（prepare）：调用 `script.prepare(ctx)`，用 inquirer 渲染问题，收集 answers
- [x] 5.7 实现 Phase 3（action）：构造 `InstallHelpers` 实例，调用 `script.action(answers, ctx, helpers)`，try/catch 包裹
- [x] 5.8 实现 FileTree 事务：action 成功则 commit，异常则 rollback
- [x] 5.9 实现摘要输出：commit 后遍历 FileTree 统计变更，输出 git-diff 风格摘要

## 6. 组件包 install script

- [x] 6.1 为 `packages/database-component/` 新增 `sora-component.json` 和 `src/cli/install.ts`：询问 componentName/enumKey/databaseType/enableMigration，addComponentToCom + ensureDir + mergeJSON + appendToConfigTemplate
- [x] 6.2 为 `packages/redis-component/` 新增 `sora-component.json` 和 `src/cli/install.ts`：询问 componentName/enumKey，addComponentToCom + appendToConfigTemplate
- [x] 6.3 为 `packages/etcd-component/` 新增 `sora-component.json` 和 `src/cli/install.ts`：询问 componentName/enumKey，addComponentToCom + appendToConfigTemplate
- [x] 6.4 确保各组件包的 `tsconfig.json` 编译配置包含 `src/cli/` 目录，且 `package.json` exports 暴露 install script 路径
