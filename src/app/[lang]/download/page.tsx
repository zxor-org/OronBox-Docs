import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  FileArchive,
  FileCheck2,
  Globe,
  History,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { withLocale } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import {
  getRelease,
  linuxDownloadOptions,
  recommendedFor,
  type Arch,
  type Os,
  type PackageKind,
} from '@/lib/releases';
import { DownloadButton } from '@/components/download-detect';
import { DownloadOptionButton } from '@/components/download-option-button';
import { ProxiedAnchor } from '@/components/proxied-anchor';
import { Reveal } from '@/components/reveal';
import {
  AndroidIcon,
  AppleIcon,
  AppImageIcon,
  ArchLinuxIcon,
  DebianIcon,
  FedoraIcon,
  FlatpakIcon,
  LinuxIcon,
  WindowsIcon,
} from '@/components/brand-icons';

type Locale = 'zh' | 'en';
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const copy = {
  hero: {
    title: { zh: '下载 OronBox', en: 'Download OronBox' },
    subtitle: {
      zh: '选择你的平台，开始管理你的穿戴设备',
      en: 'Pick your platform and start managing your wearables',
    },
    prerelease: { zh: '预发布版本', en: 'Prerelease' },
    download: { zh: '下载', en: 'Download' },
    downloadFor: {
      windows: { zh: ' Windows 版', en: ' for Windows' },
      macos: { zh: ' macOS 版', en: ' for macOS' },
      linux: { zh: ' Linux 版', en: ' for Linux' },
      android: { zh: ' Android 版', en: ' for Android' },
      web: { zh: ' Web 版', en: ' for Web' },
    } as Record<Os, { zh: string; en: string }>,
    fallback: { zh: '查看全部下载选项', en: 'See all download options' },
    githubMirrorTesting: {
      zh: 'GitHub镜像测速中...',
      en: 'Testing GitHub mirrors...',
    },
    downloadStarting: { zh: '开始下载...', en: 'Starting download...' },
  },
  recommended: { zh: '推荐', en: 'Recommended' },
  platforms: {
    windows: {
      name: 'Windows',
      note: { zh: 'x64 安装包与压缩包', en: 'x64 installer and archive' },
    },
    macos: {
      name: 'macOS',
      note: { zh: 'Intel 与 Apple Silicon 通用', en: 'For Intel and Apple Silicon' },
    },
    linux: {
      name: 'Linux',
      note: {
        zh: '.AppImage / .flatpak / .deb / .rpm / .pkg.tar.zst / .tar.gz',
        en: '.AppImage / .flatpak / .deb / .rpm / .pkg.tar.zst / .tar.gz',
      },
    },
    android: {
      name: 'Android',
      note: {
        zh: 'arm64-v8a / armeabi-v7a / x86_64',
        en: 'arm64-v8a / armeabi-v7a / x86_64',
      },
    },
    web: {
      name: 'Web',
      note: { zh: '自部署静态包', en: 'Self-hosted static bundle' },
    },
  } as Record<Os, { name: string; note: { zh: string; en: string } }>,
  footer: {
    checksums: { zh: 'SHA256 校验和', en: 'SHA256 checksums' },
    allReleases: { zh: '全部历史版本', en: 'All releases' },
  },
} as const;

const platformIcons: Record<Os, IconComponent> = {
  windows: WindowsIcon,
  macos: AppleIcon,
  linux: LinuxIcon,
  android: AndroidIcon,
  web: Globe as unknown as IconComponent,
};

const linuxFormatIcons: Partial<Record<PackageKind, IconComponent>> = {
  appimage: AppImageIcon,
  flatpak: FlatpakIcon,
  deb: DebianIcon,
  rpm: FedoraIcon,
  arch: ArchLinuxIcon,
  targz: FileArchive as unknown as IconComponent,
};

const linuxFormatNames: Partial<Record<PackageKind, string>> = {
  appimage: 'AppImage',
  flatpak: 'Flatpak',
  deb: 'Debian / Ubuntu',
  rpm: 'Fedora / RHEL / openSUSE',
  arch: 'Arch Linux',
  targz: 'tar.gz',
};

const linuxKindOrder: PackageKind[] = [
  'appimage',
  'flatpak',
  'deb',
  'rpm',
  'arch',
  'targz',
];

const platformOrder: Os[] = ['android', 'macos', 'linux', 'windows', 'web'];

const archOrder: Record<Arch, number> = {
  x64: 0,
  arm64: 1,
  armv7: 2,
  universal: 3,
  any: 4,
};

/** Android listing order: arm64-v8a → armeabi-v7a → x86_64 → aab */
const androidArchOrder: Record<Arch, number> = {
  arm64: 0,
  armv7: 1,
  x64: 2,
  any: 3,
  universal: 4,
};

/** recommended package kind per platform, for the 推荐 badge.
    linux has no single recommendation — 6 formats, none highlighted. */
const recommendedKind: Record<Os, PackageKind | null> = {
  windows: 'exe',
  macos: 'dmg',
  linux: null,
  android: 'apk',
  web: 'web',
};

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const pick = <T,>(v: { zh: T; en: T }) => v[locale] ?? v.zh;

  const release = await getRelease();
  const linuxOptions = linuxDownloadOptions(release);

  const picks: Partial<Record<Os, { url: string; format: string }>> = {};
  for (const os of platformOrder) {
    const option = recommendedFor(release, os, os === 'android' ? 'arm64' : 'x64');
    if (option) picks[os] = { url: option.url, format: option.format };
  }
  const downloadTexts = {
    download: pick(copy.hero.download),
    forOs: {
      windows: pick(copy.hero.downloadFor.windows),
      macos: pick(copy.hero.downloadFor.macos),
      linux: pick(copy.hero.downloadFor.linux),
      android: pick(copy.hero.downloadFor.android),
      web: pick(copy.hero.downloadFor.web),
    },
    fallback: pick(copy.hero.fallback),
  };

  const byOs = (os: Os) =>
    release.options
      .filter((o) => o.os === os)
      .sort(
        (a, b) =>
          (os === 'android' ? androidArchOrder : archOrder)[a.arch] -
          (os === 'android' ? androidArchOrder : archOrder)[b.arch],
      );

  const linuxByKind = linuxKindOrder
    .map((kind) => ({
      kind,
      options: byOs('linux').filter((o) => o.kind === kind),
    }))
    .filter((group) => group.options.length > 0);

  return (
    <HomeLayout {...baseOptions(lang)}>
      {/* Hero */}
      <section className="relative isolate flex flex-col items-center overflow-clip px-6 pb-16 pt-24 text-center">
        <div className="hero-atmosphere" aria-hidden />
        <div className="hero-edge-fade" aria-hidden />
        <div className="z-10 flex flex-col items-center gap-4">
          <h1
            className="hero-rise font-brand text-[clamp(36px,6vw,64px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--color-fd-foreground)]"
            style={{ '--rise-delay': '60ms' } as React.CSSProperties}
          >
            {pick(copy.hero.title)}
          </h1>
          <p
            className="hero-rise text-[1.0625rem] text-fd-muted-foreground sm:text-lg"
            style={{ '--rise-delay': '140ms' } as React.CSSProperties}
          >
            {pick(copy.hero.subtitle)}
          </p>
          <div
            className="hero-rise flex items-center gap-2"
            style={{ '--rise-delay': '220ms' } as React.CSSProperties}
          >
            <span className="rounded-full bg-[var(--md-sys-color-secondary-container)] px-3 py-1 text-xs font-semibold text-[var(--md-sys-color-on-secondary-container)]">
              {release.tag}
            </span>
            {release.prerelease && (
              <span className="rounded-full bg-[var(--md-custom-color-amber-container)] px-3 py-1 text-xs font-semibold text-[var(--md-custom-color-on-amber-container)]">
                {pick(copy.hero.prerelease)}
              </span>
            )}
          </div>
          <div
            className="hero-rise mt-4 flex flex-wrap items-center justify-center gap-3"
            style={{ '--rise-delay': '320ms' } as React.CSSProperties}
          >
            <DownloadButton
              picks={picks}
              texts={downloadTexts}
              downloadPageHref="#all"
              variant="filled"
              className="min-h-14 px-8 text-base"
              linuxOptions={linuxOptions}
              githubToastMessage={pick(copy.hero.githubMirrorTesting)}
              downloadToastMessage={pick(copy.hero.downloadStarting)}
            />
          </div>
        </div>
      </section>

      {/* All platforms */}
      <section
        id="all"
        className="mx-auto flex w-full max-w-5xl scroll-mt-24 flex-col gap-6 px-6 pb-20"
      >
        {platformOrder.map((os, gi) => {
          const PlatformIcon = platformIcons[os];
          const platform = copy.platforms[os];
          return (
            <Reveal key={os} delay={gi * 80}>
              <div
                className="rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] p-6 sm:p-8"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                    <PlatformIcon className="size-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--color-fd-foreground)]">
                      {platform.name}
                    </h2>
                    <p className="text-sm text-fd-muted-foreground">
                      {pick(platform.note)}
                    </p>
                  </div>
                </div>

                {os === 'linux' ? (
                  <div className="flex flex-col gap-3">
                    {linuxByKind.map(({ kind, options }) => {
                      const FormatIcon = linuxFormatIcons[kind] ?? FileArchive;
                      return (
                        <div
                          key={kind}
                          className="flex flex-col gap-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--color-fd-foreground)]">
                              <FormatIcon className="size-5" />
                            </span>
                            <span className="font-medium text-[var(--color-fd-foreground)]">
                              {linuxFormatNames[kind]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {options.map((option) => (
                              <DownloadOptionButton
                                key={option.name}
                                option={option}
                                recommended={
                                  recommendedKind.linux !== null &&
                                  kind === recommendedKind.linux &&
                                  option.arch === 'x64'
                                }
                                recommendedLabel={pick(copy.recommended)}
                                githubToastMessage={pick(copy.hero.githubMirrorTesting)}
                                downloadToastMessage={pick(copy.hero.downloadStarting)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {byOs(os).map((option) => (
                      <DownloadOptionButton
                        key={option.name}
                        option={option}
                        recommended={
                          option.kind === recommendedKind[os] &&
                          (os === 'android'
                            ? option.arch === 'arm64'
                            : option.arch === 'x64' ||
                              option.arch === 'universal' ||
                              option.arch === 'any')
                        }
                        recommendedLabel={pick(copy.recommended)}
                        githubToastMessage={pick(copy.hero.githubMirrorTesting)}
                        downloadToastMessage={pick(copy.hero.downloadStarting)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}

        {/* integrity & history */}
        <Reveal delay={120}>
          <div className="flex flex-col items-center gap-3 rounded-[28px] bg-[var(--md-sys-color-surface-container)] p-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {release.checksumsUrl && (
                <ProxiedAnchor
                  href={release.checksumsUrl}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--md-sys-color-surface-container-high)] px-4 text-sm font-medium text-[var(--color-fd-foreground)] no-underline transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[var(--md-sys-color-secondary-container)] hover:text-[var(--md-sys-color-on-secondary-container)]"
                  githubToastMessage={pick(copy.hero.githubMirrorTesting)}
                  downloadToastMessage={pick(copy.hero.downloadStarting)}
                >
                  <FileCheck2 className="size-4" />
                  {pick(copy.footer.checksums)}
                </ProxiedAnchor>
              )}
              <ProxiedAnchor
                href={release.pageUrl.replace(/\/tag\/.*$/, '')}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--md-sys-color-surface-container-high)] px-4 text-sm font-medium text-[var(--color-fd-foreground)] no-underline transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[var(--md-sys-color-secondary-container)] hover:text-[var(--md-sys-color-on-secondary-container)]"
                githubToastMessage={pick(copy.hero.githubMirrorTesting)}
                downloadToastMessage={pick(copy.hero.downloadStarting)}
              >
                <History className="size-4" />
                {pick(copy.footer.allReleases)}
              </ProxiedAnchor>
            </div>
          </div>
        </Reveal>
      </section>
    </HomeLayout>
  );
}
