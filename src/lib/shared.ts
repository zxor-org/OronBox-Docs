export const appName = 'OronBox';

export const gitConfig = {
  user: 'zxor-org',
  repo: 'OronBox-Docs',
  branch: 'main',
};

export const sections = [
  {
    slug: 'user',
    url: '/user',
    title: { zh: '用户文档', en: 'User Guide' },
    description: {
      zh: '安装、连接设备、资源库与插件的日常使用',
      en: 'Install, connect devices, and use the registry and plugins',
    },
  },
  {
    slug: 'creator',
    url: '/creator',
    title: { zh: '创作者文档', en: 'Creator Guide' },
    description: {
      zh: '发布表盘与快应用、草稿、审核与合集',
      en: 'Publish watchfaces and quick apps, drafts, review, and collections',
    },
  },
  {
    slug: 'plugins',
    url: '/plugins',
    title: { zh: '插件开发', en: 'Plugin Development' },
    description: {
      zh: '从零开发、打包并分发 OronBox 插件',
      en: 'Build, package, and distribute OronBox plugins',
    },
  },
  {
    slug: 'about',
    url: '/about',
    title: { zh: '关于', en: 'About' },
    description: {
      zh: 'OronBox 是什么、价值观与路线图',
      en: 'What OronBox is, its values, and the roadmap',
    },
  },
] as const;

export type SectionSlug = (typeof sections)[number]['slug'];
