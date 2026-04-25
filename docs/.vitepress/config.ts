import { defineConfig } from 'vitepress'
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

function getApiSidebarGroups(): { text: string; collapsed: boolean; items: { text: string; link: string }[] }[] {
  const apiDir = join(__dirname, '..', 'api')
  if (!existsSync(apiDir)) return []

  const labelMap: Record<string, string> = {
    classes: '类',
    interfaces: '接口',
    enumerations: '枚举',
    'type-aliases': '类型别名',
    variables: '变量',
  }

  const groups: { text: string; collapsed: boolean; items: { text: string; link: string }[] }[] = []

  const indexFile = join(apiDir, 'index.md')
  const items: { text: string; link: string }[] = []
  if (existsSync(indexFile)) {
    items.push({ text: '概览', link: '/api/' })
  }

  const subdirs = readdirSync(apiDir).sort()
  for (const subdir of subdirs) {
    const subdirPath = join(apiDir, subdir)
    if (!statSync(subdirPath).isDirectory()) continue

    const mdFiles = readdirSync(subdirPath)
      .filter(f => f.endsWith('.md'))
      .sort()

    const groupItems = mdFiles.map(f => ({
      text: f.replace('.md', ''),
      link: `/api/${subdir}/${f.replace('.md', '')}`,
    }))

    groups.push({
      text: labelMap[subdir] || subdir,
      collapsed: true,
      items: groupItems,
    })
  }

  if (items.length > 0) {
    return [{ text: 'API Reference', collapsed: false, items }, ...groups]
  }

  return groups
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Sora',
  description: '高性能 TypeScript 微服务框架',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],
  themeConfig: {
    nav: nav(),
    sidebar: sidebar(),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sora-soft/sora-monorepo' },
    ],
    footer: {
      message: '基于 WTFPL 许可发布',
    },
    search: {
      provider: 'local',
    },
    outline: {
      label: '页面导航',
      level: [2, 3],
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    lastUpdated: {
      text: '最后更新于',
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})

function nav() {
  return [
    { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
    { text: '微服务架构', link: '/microservice/core-concepts', activeMatch: '/microservice/' },
    { text: 'RPC 通信', link: '/rpc/overview', activeMatch: '/rpc/' },
    { text: '工具', link: '/advanced/validation', activeMatch: '/advanced/' },
    { text: 'CLI', link: '/cli/commands', activeMatch: '/cli/' },
    { text: 'API', link: '/api/', activeMatch: '/api/' },
  ]
}

function sidebar() {
  return {
    '/guide/': [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '微服务', link: '/guide/microservice' },
          { text: '使用组件', link: '/guide/components' },
          { text: '文档与类型导出', link: '/guide/export' },
        ],
      },
    ],
    '/microservice/': [
      {
        text: '微服务架构',
        items: [
          { text: '核心概念', link: '/microservice/core-concepts' },
          { text: '服务发现', link: '/microservice/discovery' },
          { text: 'Worker', link: '/microservice/worker' },
          { text: 'Service', link: '/microservice/service' },
          { text: 'Singleton', link: '/microservice/singleton' },
          { text: 'Executor', link: '/microservice/executor' },
          { text: '生命周期', link: '/microservice/service-lifecycle' },
          { text: '组件系统', link: '/microservice/component' },
        ],
      },
    ],
    '/rpc/': [
      {
        text: 'RPC 通信',
        items: [
          { text: '概览', link: '/rpc/overview' },
          { text: '路由 (Route)', link: '/rpc/route' },
          { text: '消息监听 (Listener)', link: '/rpc/listener' },
          { text: '调用方 (Provider)', link: '/rpc/provider' },
          { text: '编码器 (Codec)', link: '/rpc/codec' },
          { text: '连接器 (Connector)', link: '/rpc/connector' },
        ],
      },
    ],
    '/advanced/': [
      {
        text: '工具',
        items: [
          { text: '配置文件', link: '/advanced/config' },
          { text: '参数验证', link: '/advanced/validation' },
          { text: '上下文与作用域', link: '/advanced/context-scope' },
          { text: '分布式追踪', link: '/advanced/observability' },
          { text: '日志', link: '/advanced/logging' },
        ],
      },
    ],
    '/cli/': [
      {
        text: 'CLI',
        items: [
          { text: '命令手册', link: '/cli/commands' },
          { text: 'sora.json 配置', link: '/cli/sora-json' },
        ],
      },
    ],
    '/api/': getApiSidebarGroups(),
    '/templates': [
      {
        text: '项目模板',
        items: [
          { text: '模板列表', link: '/templates' },
        ],
      },
    ],
  }
}
