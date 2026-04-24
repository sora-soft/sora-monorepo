# 项目模板

sora 提供以下项目模板，可通过 `sora new` 命令创建项目。

## http-server-template

单进程 HTTP 服务器模板，使用 RamDiscovery（无需 etcd），适合独立 API 服务。

- 包：`@sora-soft/http-server-template`
- 源码：[apps/http-server-template](https://github.com/sora-soft/sora-monorepo/tree/main/apps/http-server-template)

## base-cluster-template

集群模板，包含网关和业务服务，使用 etcd 进行服务发现，适合微服务集群。

- 包：`@sora-soft/base-cluster-template`
- 源码：[apps/base-cluster-template](https://github.com/sora-soft/sora-monorepo/tree/main/apps/base-cluster-template)

## account-cluster-template

完整的账户系统集群模板，包含用户注册、登录等功能，使用 etcd 进行服务发现。

- 包：`@sora-soft/account-cluster-template`
- 源码：[apps/account-cluster-template](https://github.com/sora-soft/sora-monorepo/tree/main/apps/account-cluster-template)

---

每个模板的详细使用说明请参考其源码目录下的 README 文件。
