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
  title: 'sora',
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
    { text: 'RPC 通信', link: '/rpc/overview', activeMatch: '/rpc/' },
    { text: '服务发现', link: '/discovery/overview', activeMatch: '/discovery/' },
    { text: '组件', link: '/components/overview', activeMatch: '/components/' },
    { text: '高级', link: '/advanced/singleton', activeMatch: '/advanced/' },
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
          { text: '核心概念', link: '/guide/core-concepts' },
          { text: '服务生命周期', link: '/guide/service-lifecycle' },
        ],
      },
    ],
    '/rpc/': [
      {
        text: 'RPC 通信',
        items: [
          { text: '概览', link: '/rpc/overview' },
          { text: '路由 (Route)', link: '/rpc/route' },
          { text: '调用方 (Provider)', link: '/rpc/provider' },
          { text: '传输层', link: '/rpc/transport' },
        ],
      },
    ],
    '/discovery/': [
      {
        text: '服务发现',
        items: [
          { text: '概览与选型', link: '/discovery/overview' },
        ],
      },
    ],
    '/components/': [
      {
        text: '组件',
        items: [
          { text: '组件系统', link: '/components/overview' },
          { text: 'Redis', link: '/components/redis' },
          { text: 'Database', link: '/components/database' },
          { text: 'etcd', link: '/components/etcd' },
        ],
      },
    ],
    '/advanced/': [
      {
        text: '高级',
        items: [
          { text: '单例服务与选举', link: '/advanced/singleton' },
          { text: '参数验证', link: '/advanced/validation' },
          { text: '上下文与作用域', link: '/advanced/context-scope' },
          { text: '可观测性', link: '/advanced/observability' },
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
