## 1. 模板重写

- [x] 1.1 重写 `template/service/Service.ts.art`：迁移到 typia，添加 standalone 条件（extends SingletonService）、listeners 条件（tcp/websocket/http 的 import、options 字段、startup 中的 listener 创建和 installListener）、handler 关联
- [x] 1.2 重写 `template/worker/Worker.ts.art`：迁移到 typia，添加 standalone 条件（extends SingletonWorker），保持 register/constructor/startup/shutdown/declare options 完整结构
- [x] 1.3 新增 `template/command/CommandWorker.ts.art`：typia 校验、static register、constructor、startup/shutdown、runCommand 方法骨架
- [x] 1.4 更新 `template/handler/Handler.ts.art`：移除 `@ValidateClass` 装饰器，确保与当前 Route 子类风格一致

## 2. generate:service 命令重写

- [x] 2.1 修改 `src/commands/generate/service.ts`：将 `--name` flag 改为位置参数 `<name>`，添加 `--listeners`（string flag，逗号分隔）和 `--standalone`（boolean flag）
- [x] 2.2 添加交互模式：当 name 缺失时用 inquirer prompt 输入；当 standalone 缺失时用 confirm 询问；当 listeners 缺失时用 checkbox 多选（none/tcp/websocket/http，none 与其他互斥）
- [x] 2.3 添加 listeners 解析逻辑：将逗号分隔字符串解析为数组，校验值合法性，处理 "none" 与其他选项的互斥关系
- [x] 2.4 添加条件性模板数据：将 listeners 数组、standalone 布尔值传入模板渲染数据
- [x] 2.5 添加 Handler 联动生成：当 listeners 非空且非 none 时，在 handlerDir 下自动生成 `{Name}Handler.ts`

## 3. generate:worker 命令重写

- [x] 3.1 修改 `src/commands/generate/worker.ts`：将 `--name` flag 改为位置参数 `<name>`，添加 `--standalone`（boolean flag）
- [x] 3.2 添加交互模式：当 name 缺失时用 inquirer prompt 输入；当 standalone 缺失时用 confirm 询问
- [x] 3.3 添加条件性模板数据：将 standalone 布尔值传入模板渲染数据

## 4. generate:command 命令新增

- [x] 4.1 新增 `src/commands/generate/command.ts`：oclif 命令类，位置参数 `<name>`，支持交互模式
- [x] 4.2 实现文件生成逻辑：渲染 CommandWorker.ts.art 模板，创建文件到 workerDir
- [x] 4.3 实现 AST 注册：在 WorkerName enum 添加 `{Name}Command` 成员，在 WorkerRegister.init() 添加 `{Name}CommandWorker.register()` 调用

## 5. 验证

- [x] 5.1 验证 generate:service 完整参数模式（如 `generate:service Auth --listeners tcp,ws --standalone`）生成的文件内容正确
- [x] 5.2 验证 generate:service 交互模式正常工作
- [x] 5.3 验证 generate:worker 完整参数模式和交互模式
- [x] 5.4 验证 generate:command 生成的文件结构和 AST 注册
- [x] 5.5 验证 listeners=none 时不生成 Handler 且 startup 为空
