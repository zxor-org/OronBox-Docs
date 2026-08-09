import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { withLocale } from './i18n';
import { appName, gitConfig, sections } from './shared';

export function baseOptions(lang: string): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={22} height={22} className="rounded-md dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-dark.svg" alt="" width={22} height={22} className="hidden rounded-md dark:block" />
          <span className="font-brand">{appName}</span>
        </span>
      ),
    },
    links: [
      {
        text: lang === 'zh' ? '下载' : 'Download',
        url: withLocale(lang, '/download'),
      },
      ...sections.map((section) => ({
        text: section.title[lang as 'zh' | 'en'] ?? section.title.zh,
        url: withLocale(lang, section.url),
        active: 'nested-url' as const,
      })),
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
