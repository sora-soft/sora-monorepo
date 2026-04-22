## Why

`sora.json` 中已预留了 `componentNameEnum` 和 `comClass` 字段，但 CLI 从未消费它们。目前添加一个 component（如 database、redis、etcd）需要开发者手动完成多个步骤：安装 npm 包、修改 Com.ts（添加 import、enum 成员、static 实例、register 调用）、创建目录（如 migration/）、修改 config.template.yml、合并 sora.json 字段。这个过程重复且易出错，应该由 CLI 命令自动化。

## What Changes

- **新增 `sora add:component <package>` 命令**：自动执行 `npm install --save`，读取包内的 `sora-component.json`，加载并运行组件包提供的 install script
- **新增 `sora-component.json` 约定**：组件包通过此文件声明 install script 路径
- **新增 ComponentInstallScript 接口约定**：组件包提供 `prepare()` + `action()` 两阶段初始化流程
- **增强 `ConfigTemplateInserter`**：支持 `components` section 的追加和 `#define` 语句的追加
- **为现有组件包添加 install script**：database-component、redis-component、etcd-component 各自实现

## Capabilities

### New Capabilities
- `add-component-command`: `sora add:component` 命令的核心流程——安装包、加载 install script、交互式询问、执行文件变更、事务提交
- `component-install-script`: 组件包侧的约定——`sora-component.json` 格式、`ComponentInstallScript` 接口（prepare + action）、helpers API

### Modified Capabilities
- `auto-config-insert`: 需扩展以支持 `components` section 追加和 `#define` 语句追加

## Impact

- **packages/sora-cli/**: 新增 `add/component.ts` 命令、新增 `ComponentInstaller` 类、增强 `ConfigTemplateInserter`
- **packages/database-component/**: 新增 `sora-component.json` + `src/cli/install.ts`
- **packages/redis-component/**: 新增 `sora-component.json` + `src/cli/install.ts`
- **packages/etcd-component/**: 新增 `sora-component.json` + `src/cli/install.ts`
- **apps/*-template/**: 间接影响——通过命令生成的代码将改变模板项目的 Com.ts / config.template.yml
