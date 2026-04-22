## MODIFIED Requirements

### 需求:TEMPLATES 常量包含可用模板列表
`sora new` 命令的 TEMPLATES 常量必须在现有 `@sora-soft/example-template` 基础上新增 `@sora-soft/http-server-template` 条目，描述为极简 HTTP 服务模板。

#### 场景:用户交互选择模板
- **当** 用户运行 `sora new my-project` 未指定 template 参数
- **那么** 交互列表中显示 `@sora-soft/http-server-template - Sora minimal HTTP server template` 选项

#### 场景:用户直接指定模板
- **当** 用户运行 `sora new my-project @sora-soft/http-server-template`
- **那么** 直接下载该模板包，不进入交互选择
