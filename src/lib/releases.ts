/**
 * OronBox release data: fetches the newest GitHub release at build time and
 * parses asset filenames into structured download options.
 * Falls back to a pinned manifest when the API is unreachable.
 */

export type Os = 'windows' | 'macos' | 'linux' | 'android' | 'web';
export type Arch = 'x64' | 'arm64' | 'armv7' | 'universal' | 'any';

export type PackageKind =
  | 'zip'
  | 'dmg'
  | 'exe'
  | 'appimage'
  | 'flatpak'
  | 'deb'
  | 'rpm'
  | 'arch'
  | 'targz'
  | 'apk'
  | 'aab'
  | 'web';

export interface DownloadOption {
  name: string;
  url: string;
  os: Os;
  arch: Arch;
  kind: PackageKind;
  /** human label for the format, e.g. "AppImage", ".deb" */
  format: string;
}

/** One entry of the Linux download dropdown menu. */
export interface LinuxOption {
  url: string;
  format: string;
  arch: Arch;
  archLabel: string;
}

export interface ReleaseInfo {
  tag: string;
  pageUrl: string;
  prerelease: boolean;
  options: DownloadOption[];
  checksumsUrl: string | null;
}

const REPO = 'zxor-org/OronBox';
const API = `https://api.github.com/repos/${REPO}/releases`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases`;

function normalizeArch(raw: string): Arch {
  switch (raw) {
    case 'amd64':
    case 'x86_64':
      return 'x64';
    case 'aarch64':
    case 'arm64':
    case 'arm64-v8a':
      return 'arm64';
    case 'armeabi-v7a':
      return 'armv7';
    case 'universal':
      return 'universal';
    default:
      return 'any';
  }
}

/** Parse one asset filename into a DownloadOption, or null to skip it. */
function parseAsset(name: string, url: string): DownloadOption | null {
  if (name.includes('.symbols.')) return null;

  let m: RegExpMatchArray | null;

  if ((m = name.match(/-windows-(amd64|x86_64|arm64)-setup\.exe$/)))
    return { name, url, os: 'windows', arch: normalizeArch(m[1]), kind: 'exe', format: '.exe' };

  if ((m = name.match(/-windows-(amd64|x86_64|arm64)\.zip$/)))
    return { name, url, os: 'windows', arch: normalizeArch(m[1]), kind: 'zip', format: '.zip' };

  if ((m = name.match(/-macos-universal\.(dmg|zip)$/)))
    return { name, url, os: 'macos', arch: 'universal', kind: m[1] as 'dmg' | 'zip', format: `.${m[1]}` };

  if ((m = name.match(/-linux-(amd64|arm64)\.AppImage$/)))
    return { name, url, os: 'linux', arch: normalizeArch(m[1]), kind: 'appimage', format: '.AppImage' };

  if ((m = name.match(/-linux-(amd64|arm64)\.flatpak$/)))
    return { name, url, os: 'linux', arch: normalizeArch(m[1]), kind: 'flatpak', format: '.flatpak' };

  if ((m = name.match(/-linux-(amd64|arm64)\.tar\.gz$/)))
    return { name, url, os: 'linux', arch: normalizeArch(m[1]), kind: 'targz', format: '.tar.gz' };

  if ((m = name.match(/\.(x86_64|aarch64)\.rpm$/)))
    return { name, url, os: 'linux', arch: normalizeArch(m[1]), kind: 'rpm', format: '.rpm' };

  if ((m = name.match(/_(amd64|arm64)\.deb$/)))
    return { name, url, os: 'linux', arch: normalizeArch(m[1]), kind: 'deb', format: '.deb' };

  if ((m = name.match(/-(x86_64|aarch64)\.pkg\.tar\.zst$/)))
    return { name, url, os: 'linux', arch: normalizeArch(m[1]), kind: 'arch', format: '.pkg.tar.zst' };

  if ((m = name.match(/-android-(arm64-v8a|armeabi-v7a|x86_64)\.apk$/)))
    return { name, url, os: 'android', arch: normalizeArch(m[1]), kind: 'apk', format: '.apk' };

  if (name.match(/-android-appbundle\.aab$/))
    return { name, url, os: 'android', arch: 'any', kind: 'aab', format: '.aab' };

  if (name.match(/-web\.zip$/))
    return { name, url, os: 'web', arch: 'any', kind: 'web', format: '.zip' };

  return null;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  prerelease: boolean;
  assets: GitHubAsset[];
}

function toReleaseInfo(raw: GitHubRelease): ReleaseInfo {
  const options: DownloadOption[] = [];
  let checksumsUrl: string | null = null;
  for (const asset of raw.assets) {
    if (asset.name === 'sha256sums.txt') {
      checksumsUrl = asset.browser_download_url;
      continue;
    }
    const parsed = parseAsset(asset.name, asset.browser_download_url);
    if (parsed) options.push(parsed);
  }
  return {
    tag: raw.tag_name,
    pageUrl: raw.html_url,
    prerelease: raw.prerelease,
    options,
    checksumsUrl,
  };
}

/** Pinned copy of v1.0.0-rc.1 so the page still renders if the API fails. */
const FALLBACK: ReleaseInfo = toReleaseInfo({
  tag_name: 'v1.0.0-rc.1',
  html_url: `${RELEASES_PAGE}/tag/v1.0.0-rc.1`,
  prerelease: true,
  assets: [
    'oronbox-1.0.0-0.1.rc.1.aarch64.rpm',
    'oronbox-1.0.0-0.1.rc.1.x86_64.rpm',
    'oronbox-1.0.0-rc.1-android-appbundle.aab',
    'oronbox-1.0.0-rc.1-android-arm64-v8a.apk',
    'oronbox-1.0.0-rc.1-android-armeabi-v7a.apk',
    'oronbox-1.0.0-rc.1-android-x86_64.apk',
    'oronbox-1.0.0-rc.1-linux-amd64.AppImage',
    'oronbox-1.0.0-rc.1-linux-amd64.flatpak',
    'oronbox-1.0.0-rc.1-linux-amd64.tar.gz',
    'oronbox-1.0.0-rc.1-linux-arm64.AppImage',
    'oronbox-1.0.0-rc.1-linux-arm64.flatpak',
    'oronbox-1.0.0-rc.1-linux-arm64.tar.gz',
    'oronbox-1.0.0-rc.1-macos-universal.dmg',
    'oronbox-1.0.0-rc.1-macos-universal.zip',
    'oronbox-1.0.0-rc.1-web.zip',
    'oronbox-1.0.0-rc.1-windows-amd64-setup.exe',
    'oronbox-1.0.0-rc.1-windows-amd64.zip',
    'oronbox-1.0.0.rc.1-1-aarch64.pkg.tar.zst',
    'oronbox-1.0.0.rc.1-1-x86_64.pkg.tar.zst',
    'oronbox_1.0.0.rc.1-1_amd64.deb',
    'oronbox_1.0.0.rc.1-1_arm64.deb',
    'sha256sums.txt',
  ].map((name) => ({
    name,
    browser_download_url: `${RELEASES_PAGE}/download/v1.0.0-rc.1/${name}`,
  })),
});

export async function getRelease(): Promise<ReleaseInfo> {
  try {
    const res = await fetch(API, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK;
    const releases = (await res.json()) as GitHubRelease[];
    // `/releases/latest` 404s while every release is a prerelease,
    // so take the first entry of the list instead
    const newest = releases[0];
    if (!newest) return FALLBACK;
    return toReleaseInfo(newest);
  } catch {
    return FALLBACK;
  }
}

/** Best single pick for a detected platform/arch, used by the auto-detect button. */
export function recommendedFor(
  release: ReleaseInfo,
  os: Os,
  arch: Arch,
): DownloadOption | null {
  const forOs = release.options.filter((o) => o.os === os);
  if (forOs.length === 0) return null;

  const byArch = (kind: PackageKind) =>
    forOs.find((o) => o.kind === kind && o.arch === arch) ??
    forOs.find((o) => o.kind === kind && (o.arch === 'universal' || o.arch === 'any')) ??
    forOs.find((o) => o.kind === kind);

  switch (os) {
    case 'windows':
      return byArch('exe') ?? byArch('zip') ?? forOs[0];
    case 'macos':
      return byArch('dmg') ?? byArch('zip') ?? forOs[0];
    case 'linux':
      return byArch('appimage') ?? byArch('flatpak') ?? byArch('deb') ?? forOs[0];
    case 'android':
      return byArch('apk') ?? forOs[0];
    case 'web':
      return byArch('web') ?? forOs[0];
  }
}

const linuxKindOrder: PackageKind[] = [
  'appimage',
  'flatpak',
  'deb',
  'rpm',
  'arch',
  'targz',
];

const archRank: Record<Arch, number> = {
  x64: 0,
  arm64: 1,
  armv7: 2,
  universal: 3,
  any: 4,
};

/** All Linux packages for the dropdown menu: kind order, then arch. */
export function linuxDownloadOptions(release: ReleaseInfo): LinuxOption[] {
  return release.options
    .filter((o) => o.os === 'linux')
    .sort(
      (a, b) =>
        linuxKindOrder.indexOf(a.kind) - linuxKindOrder.indexOf(b.kind) ||
        archRank[a.arch] - archRank[b.arch],
    )
    .map((o) => ({
      url: o.url,
      format: o.format,
      arch: o.arch,
      archLabel:
        o.arch === 'x64'
          ? 'x86_64'
          : o.arch === 'arm64'
            ? 'arm64'
            : o.arch === 'armv7'
              ? 'armeabi-v7a'
              : '',
    }));
}
