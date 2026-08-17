import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Bluetooth,
  BookOpen,
  Boxes,
  Code2,
  FileText,
  Globe,
  Info,
  MessageCircle,
  Package,
  Palette,
  Puzzle,
  Server,
  ShieldCheck,
  Star,
  Terminal,
  Upload,
  Users,
} from 'lucide-react';
import { withLocale } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { sections } from '@/lib/shared';
import { getRelease, linuxDownloadOptions, recommendedFor, type Os } from '@/lib/releases';
import {
  DownloadButton,
  type AndroidDownloadOption,
} from '@/components/download-detect';
import { cn } from '@/lib/cn';
import type { ComponentType, CSSProperties } from 'react';
import { Reveal } from '@/components/reveal';

type Locale = 'zh' | 'en';

const copy = {
  hero: {
    subtitle: {
      zh: '一个又好看又快的 VelaOS / ZeppOS 可穿戴设备管理软件，使用 Flutter 构建',
      en: 'A beautiful and fast VelaOS / ZeppOS wearable device manager, built with Flutter',
    },
    description: {
      zh: '无需官方客户端，即可连接并管理 小米VelaOS / 华米ZeppOS 设备\n从社区资源库安装应用、表盘与插件',
      en: 'Connect and manage Xiaomi VelaOS / Amazfit ZeppOS devices without the official client\nInstall apps, watchfaces and plugins from community registries',
    },
    derivedFrom: {
      prefix: { zh: '衍生自 ', en: 'Derived from ' },
      links: [
        {
          text: 'AstroBox-NG',
          href: 'https://github.com/AstralSightStudios/AstroBox-NG',
        },
        {
          text: 'GadgetBridge',
          href: 'https://codeberg.org/Freeyourgadget/Gadgetbridge',
        },
      ],
    },
  },
  cta: {
    primary: { zh: '快速上手', en: 'Quick Start' },
    github: { zh: 'GitHub', en: 'GitHub' },
    webOnline: { zh: '使用 Web 版', en: 'Use web version' },
    download: { zh: '下载', en: 'Download' },
    downloadFor: {
      windows: { zh: ' Windows 版', en: ' for Windows' },
      macos: { zh: ' macOS 版', en: ' for macOS' },
      linux: { zh: ' Linux 版', en: ' for Linux' },
      android: { zh: ' Android 版', en: ' for Android' },
      web: { zh: ' Web 版', en: ' for Web' },
    },
    downloadFallback: { zh: '更多下载选项', en: 'More download options' },
    lanzou: { zh: '蓝奏云网盘', en: 'Lanzou cloud drive' },
    githubRelease: { zh: 'GitHub Release', en: 'GitHub Release' },
    githubMirrorTesting: {
      zh: 'GitHub镜像测速中...',
      en: 'Testing GitHub mirrors...',
    },
    downloadStarting: { zh: '开始下载...', en: 'Starting download...' },
  },
  preview: {
    title: { zh: '界面一览', en: 'Take a look' },
    altMain: {
      zh: 'OronBox 桌面端设备管理界面',
      en: 'OronBox desktop device management screen',
    },
    altPhone: {
      zh: 'OronBox 手机端设备管理界面',
      en: 'OronBox Android device management screen',
    },
  },
  features: {
    title: { zh: '能力一览', en: 'Capabilities' },
    items: [
      {
        icon: Bluetooth,
        title: { zh: '直连设备', en: 'Connect devices' },
        description: {
          zh: 'BLE、SPP 与 Web Serial 多种传输方式\n无需官方客户端即可连接并管理设备',
          en: 'BLE, SPP and Web Serial transports\nConnect and manage devices without the official client',
        },
      },
      {
        icon: Boxes,
        title: { zh: '社区资源库', en: 'Community registries' },
        description: {
          zh: '米坛 BandBBS、AstroBox-Repo、华米商店与插件注册源\n一站式浏览与安装',
          en: 'BandBBS, AstroBox-Repo, the Amazfit store and the plugin registry\nBrowse and install in one place',
        },
      },
      {
        icon: Upload,
        title: { zh: '创作者中心', en: 'Creator center' },
        description: {
          zh: '打包表盘与快应用，一键发布到米坛 / AstroBox-Repo\n草稿与审核全流程管理',
          en: 'Package watchfaces and quick apps, publish to BandBBS / AstroBox-Repo\nTrack drafts and reviews end to end',
        },
      },
      {
        icon: Puzzle,
        title: { zh: '插件系统', en: 'Plugin system' },
        description: {
          zh: '高性能 QuickJS 沙箱运行时\n支持 WASM 混合模式',
          en: 'High-performance QuickJS sandbox runtime\nWASM and hybrid modes supported',
        },
      },
      {
        icon: ShieldCheck,
        title: { zh: '本地优先', en: 'Local-first' },
        description: {
          zh: '设备连接凭据与数据默认保存在本机',
          en: 'Device credentials and data stay on your machine by default',
        },
      },
      {
        icon: Terminal,
        title: { zh: '命令行工具', en: 'CLI tooling' },
        description: {
          zh: '无 GUI 环境下脚本化连接设备、安装资源\n访问社区源与控制后台任务',
          en: 'Scriptable CLI to manage devices, install resources\nand drive background tasks without the GUI',
        },
      },
    ],
  },
  platforms: {
    title: { zh: '平台支持', en: 'Platform support' },
    hint: {
      zh: '各平台连接能力与功能支持程度不同，详见用户文档',
      en: 'Connectivity and feature completeness vary per platform — see the user guide',
    },
    items: ['Windows', 'macOS', 'Linux', 'Android', 'Web'],
  },
  community: {
    title: { zh: '社区与开源', en: 'Community & open source' },
    description: {
      zh: 'OronBox 客户端与服务端代码遵循 AGPL v3.0 开源\n欢迎参与贡献与讨论',
      en: 'The OronBox client and server are open source under AGPL v3.0\nContributions and discussions are welcome',
    },
    links: [
      {
        icon: Code2,
        title: { zh: 'OronBox', en: 'OronBox' },
        description: { zh: '客户端源码', en: 'Client source code' },
        href: 'https://github.com/zxor-org/OronBox',
      },
      {
        icon: Server,
        title: { zh: 'OronBox-Server', en: 'OronBox-Server' },
        description: { zh: '服务端源码', en: 'Server source code' },
        href: 'https://github.com/zxor-org/OronBox-Server',
      },
      {
        icon: Users,
        title: { zh: 'QQ 群', en: 'QQ Group' },
        description: { zh: '加入 QQ 群', en: 'Join the QQ group' },
        href: 'https://qm.qq.com/q/il3TbmJlKM',
      },
      {
        icon: MessageCircle,
        title: { zh: 'Discussions', en: 'Discussions' },
        description: { zh: '公开讨论区', en: 'Public discussions' },
        href: 'https://github.com/zxor-org/OronBox/discussions',
      },
    ],
  },
} as const;

/** tonal chip palettes rotating across feature icons */
const accents = [
  ['var(--md-sys-color-primary-container)', 'var(--md-sys-color-on-primary-container)'],
  ['var(--md-custom-color-blue-container)', 'var(--md-custom-color-on-blue-container)'],
  ['var(--md-custom-color-teal-container)', 'var(--md-custom-color-on-teal-container)'],
  ['var(--md-custom-color-amber-container)', 'var(--md-custom-color-on-amber-container)'],
  ['var(--md-sys-color-tertiary-container)', 'var(--md-sys-color-on-tertiary-container)'],
  ['var(--md-sys-color-secondary-container)', 'var(--md-sys-color-on-secondary-container)'],
] as const;

const sectionIcons: Record<string, typeof BookOpen> = {
  user: BookOpen,
  creator: Palette,
  plugins: Puzzle,
  about: Info,
};

function DockLink({
  href,
  icon: Icon,
  children,
  variant = 'filled',
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
  variant?: 'filled' | 'outlined';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold no-underline',
        'transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        variant === 'filled'
          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:brightness-105'
          : 'text-[var(--md-sys-color-primary)] ring-1 ring-inset ring-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:ring-[var(--md-sys-color-outline)]',
      )}
    >
      <Icon className="size-5" />
      <span>{children}</span>
    </Link>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const pick = <T,>(v: { zh: T; en: T }) => v[locale] ?? v.zh;

  const release = await getRelease();
  const picks: Partial<Record<Os, { url: string; format: string }>> = {};
  for (const os of ['windows', 'macos', 'linux', 'android', 'web'] as Os[]) {
    const option = recommendedFor(release, os, os === 'android' ? 'arm64' : 'x64');
    if (option) picks[os] = { url: option.url, format: option.format };
  }
  const downloadTexts = {
    download: pick(copy.cta.download),
    forOs: {
      windows: pick(copy.cta.downloadFor.windows),
      macos: pick(copy.cta.downloadFor.macos),
      linux: pick(copy.cta.downloadFor.linux),
      android: pick(copy.cta.downloadFor.android),
      web: pick(copy.cta.downloadFor.web),
    },
    fallback: pick(copy.cta.downloadFallback),
  };
  const linuxOptions = linuxDownloadOptions(release);
  const androidOption = recommendedFor(release, 'android', 'arm64');
  const androidOptions: AndroidDownloadOption[] = [
    {
      url: 'https://cpwdxbd.lanzoue.com/oronbox',
      label: pick(copy.cta.lanzou),
      showDownloadToast: false,
    },
    ...(androidOption
      ? [{ url: androidOption.url, label: pick(copy.cta.githubRelease) }]
      : []),
  ];

  return (
    <HomeLayout {...baseOptions(lang)}>
      {/* Hero */}
      <section className="relative isolate flex flex-col items-center justify-center overflow-clip px-6 pb-14 pt-28 text-center">
        <div className="hero-atmosphere" aria-hidden />
        <div className="hero-edge-fade" aria-hidden />
        <div className="z-10 flex flex-col items-center gap-2">
          <h1
            className="hero-rise font-brand text-[clamp(40px,6.8vw,72px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--color-fd-foreground)]"
            style={{ '--rise-delay': '60ms' } as CSSProperties}
          >
            OronBox
          </h1>
          <p
            className="hero-rise max-w-full text-[1.0625rem] leading-[1.65] text-[var(--color-fd-foreground)] sm:text-[1.375rem]"
            style={{ '--rise-delay': '140ms' } as CSSProperties}
          >
            {pick(copy.hero.subtitle)}
          </p>
          <p
            className="hero-rise mt-1 max-w-2xl whitespace-pre-line text-[0.875rem] leading-[1.65] text-fd-muted-foreground sm:text-base"
            style={{ '--rise-delay': '220ms' } as CSSProperties}
          >
            {pick(copy.hero.description)}
          </p>
          <p
            className="hero-rise mt-1 text-[0.875rem] leading-[1.65] text-fd-muted-foreground sm:text-base"
            style={{ '--rise-delay': '260ms' } as CSSProperties}
          >
            {pick(copy.hero.derivedFrom.prefix)}
            <a
              href={copy.hero.derivedFrom.links[0].href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-current underline-offset-2 transition-opacity hover:opacity-80"
            >
              {copy.hero.derivedFrom.links[0].text}
            </a>
            {' & '}
            <a
              href={copy.hero.derivedFrom.links[1].href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-current underline-offset-2 transition-opacity hover:opacity-80"
            >
              {copy.hero.derivedFrom.links[1].text}
            </a>
          </p>
        </div>
        <div
          className="hero-rise z-10 mt-6 flex flex-col items-center gap-2 sm:gap-3"
          style={{ '--rise-delay': '320ms' } as CSSProperties}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <DockLink href={withLocale(lang, '/user')} icon={ArrowRight}>
              {pick(copy.cta.primary)}
            </DockLink>
            <DownloadButton
              picks={picks}
              texts={downloadTexts}
              downloadPageHref={withLocale(lang, '/download')}
              variant="tonal"
              linuxOptions={linuxOptions}
              androidOptions={androidOptions}
              githubToastMessage={pick(copy.cta.githubMirrorTesting)}
              downloadToastMessage={pick(copy.cta.downloadStarting)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <DockLink href="/web" icon={Globe} variant="outlined">
              {pick(copy.cta.webOnline)}
            </DockLink>
            <DockLink
              href={withLocale(lang, '/download')}
              icon={Package}
              variant="outlined"
            >
              {pick(copy.cta.downloadFallback)}
            </DockLink>
            <DockLink
              href="https://github.com/zxor-org/OronBox"
              icon={Star}
              variant="outlined"
            >
              {pick(copy.cta.github)}
            </DockLink>
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section
        id="preview"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-20"
      >
        <Reveal>
          <h2 className="mb-8 text-center text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[var(--color-fd-foreground)]">
            {pick(copy.preview.title)}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          {/* PC + phone side by side at equal height — widths follow the real
              aspect ratios (2268×1434 vs 1440×3200) so both end up the same height */}
          <div className="flex flex-row gap-4 md:gap-6">
            <div className="min-w-0" style={{ flexGrow: 2268 / 1434, flexBasis: 0 }}>
              <Image
                src={`/screenshots/${locale}_purple_light.png`}
                alt={pick(copy.preview.altMain)}
                width={2268}
                height={1434}
                className="h-auto w-full rounded-[20px] ring-4 ring-[var(--md-sys-color-outline)] dark:hidden"
                priority={false}
              />
              <Image
                src={`/screenshots/${locale}_purple_dark.png`}
                alt={pick(copy.preview.altMain)}
                width={2268}
                height={1434}
                className="hidden h-auto w-full rounded-[20px] ring-4 ring-[var(--md-sys-color-outline)] dark:block"
                priority={false}
              />
            </div>
            <div className="min-w-0" style={{ flexGrow: 1440 / 3200, flexBasis: 0 }}>
              <Image
                src={`/screenshots/mobile_${locale}_purple_light.png`}
                alt={pick(copy.preview.altPhone)}
                width={1440}
                height={3200}
                className="h-auto w-full rounded-xl ring-4 ring-[var(--md-sys-color-outline)] dark:hidden"
              />
              <Image
                src={`/screenshots/mobile_${locale}_purple_dark.png`}
                alt={pick(copy.preview.altPhone)}
                width={1440}
                height={3200}
                className="hidden h-auto w-full rounded-xl ring-4 ring-[var(--md-sys-color-outline)] dark:block"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Platforms */}
      <section
        id="platforms"
        className="mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-16"
      >
        <Reveal>
          <h2 className="mb-6 text-center text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[var(--color-fd-foreground)]">
            {pick(copy.platforms.title)}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {copy.platforms.items.map((item) => (
              <span
                key={item}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-fd-foreground)] ring-1 ring-inset ring-[var(--md-sys-color-outline-variant)] transition-colors duration-200 hover:bg-[var(--md-sys-color-surface-container-high)]"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-fd-muted-foreground">
            {pick(copy.platforms.hint)}
          </p>
        </Reveal>
      </section>

      {/* Features (bento) */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <Reveal>
          <h2 className="mb-8 text-center text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[var(--color-fd-foreground)]">
            {pick(copy.features.title)}
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.items.map((feature, i) => {
            const [chipBg, chipFg] = accents[i % accents.length];
            return (
              <Reveal key={feature.title.zh} delay={i * 80}>
                <div
                  className="h-full rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] p-6 transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                >
                  <span
                    className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: chipBg, color: chipFg }}
                  >
                    <feature.icon className="size-6" />
                  </span>
                  <h3 className="mb-1 text-lg font-medium text-[var(--color-fd-foreground)]">
                    {pick(feature.title)}
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-[1.65] text-fd-muted-foreground">
                    {pick(feature.description)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Documentation sections */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section, i) => {
            const Icon = sectionIcons[section.slug] ?? BookOpen;
            const [chipBg, chipFg] = accents[i % accents.length];
            return (
              <Reveal key={section.slug} delay={i * 80}>
                <Link
                  href={withLocale(lang, section.url)}
                  className="group flex h-full flex-col rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] p-6 no-underline transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                >
                  <span
                    className="mb-4 inline-flex size-12 items-center justify-center self-start rounded-2xl"
                    style={{ backgroundColor: chipBg, color: chipFg }}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h2 className="mb-1 flex items-center gap-1 text-lg font-medium text-[var(--color-fd-foreground)]">
                    {pick(section.title)}
                    <ArrowRight className="size-4 opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100" />
                  </h2>
                  <p className="text-sm leading-[1.65] text-fd-muted-foreground">
                    {pick(section.description)}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Community */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <Reveal>
          <h2 className="mb-2 text-center text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[var(--color-fd-foreground)]">
            {pick(copy.community.title)}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mb-8 max-w-2xl whitespace-pre-line text-center text-sm leading-[1.65] text-fd-muted-foreground">
            {pick(copy.community.description)}
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {copy.community.links.map((link, i) => (
            <Reveal key={link.title.zh} delay={160 + i * 80}>
              <Link
                href={link.href}
                className="group flex h-full flex-col items-center gap-2 rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] p-6 text-center no-underline transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              >
                <link.icon className="size-6 text-[var(--md-sys-color-primary)]" />
                <span className="font-medium text-[var(--color-fd-foreground)]">
                  {pick(link.title)}
                </span>
                <span className="text-sm text-fd-muted-foreground">
                  {pick(link.description)}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <footer className="border-t border-fd-border px-6 py-8 text-center text-sm text-fd-muted-foreground">
        © {new Date().getFullYear()} zxor-org · OronBox ·{' '}
        <FileText className="inline size-3.5" />{' '}
        <Link
          href="https://github.com/zxor-org/OronBox-Docs"
          className="no-underline hover:text-[var(--color-fd-foreground)]"
        >
          OronBox Docs
        </Link>
      </footer>
    </HomeLayout>
  );
}
