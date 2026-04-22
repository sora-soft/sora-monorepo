### 需求:DiagnosticCollector 收集和输出诊断信息
系统必须提供 `DiagnosticCollector` 类，库代码通过它收集 Error 和 Warning，命令层统一输出。

#### 场景:收集和输出 Warning
- **当** AnnotationReader 检测到未知 `@sora*` 标签并调用 `diagnostics.addWarning("...")`
- **那么** Warning 被存储在 collector 中，命令结束时通过 `this.warn()` 输出所有收集到的 Warning

#### 场景:收集 Error 立即停止
- **当** AnnotationReader 检测到多个 `@soraExport` 并调用 `diagnostics.addError("...")`
- **那么** Error 被存储，随后系统抛出异常停止执行，Error 信息通过异常传递

#### 场景:多个 Warning 批量输出
- **当** Pipeline 执行过程中产生了 3 个 Warning
- **那么** 命令结束时依次输出 3 条 Warning 信息，然后继续正常输出（Warning 不阻止执行）

### 需求:formatNodeLocation 工具函数
系统必须提供 `formatNodeLocation(node, sourceFile)` 工具函数，生成 `file:line` 格式的位置信息用于诊断消息。

#### 场景:格式化 AST 节点位置
- **当** 对 `src/routes/UserRoute.ts` 文件第 42 行的类声明节点调用 `formatNodeLocation`
- **那么** 返回 `"src/routes/UserRoute.ts:42"`

#### 场景:路径相对于当前工作目录
- **当** 文件绝对路径为 `/projects/my-app/src/routes/UserRoute.ts`，当前工作目录为 `/projects/my-app`
- **那么** 返回路径使用相对路径 `"src/routes/UserRoute.ts:42"`

### 需求:库代码通过 DiagnosticCollector 报告问题
所有 pipeline 库代码（AnnotationReader、Collector、Transformer、TypeResolver、Emitter、ProgramBuilder、CodeInserter）必须接收 DiagnosticCollector 实例并通过它报告问题。

#### 场景:AnnotationReader 使用 DiagnosticCollector
- **当** 创建 AnnotationReader 实例时
- **那么** 构造函数接收 DiagnosticCollector 参数，所有检测到的问题通过 collector 报告

#### 场景:CodeInserter 错误包含文件路径
- **当** CodeInserter 找不到指定的 enum 声明
- **那么** 错误信息必须包含操作的目标文件路径、enum 名称，例如 `"Enum 'ServiceNameEnum' not found in file 'src/enums/ServiceName.ts'. Check the serviceNameEnum setting in sora.json."`
