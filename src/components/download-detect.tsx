'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDownloadProxy } from '@/hooks/use-download-proxy';
import type { Arch, LinuxOption, Os } from '@/lib/releases';

export interface Pick {
  url: string;
  format: string;
}

export interface AndroidDownloadOption {
  url: string;
  label: string;
  showDownloadToast?: boolean;
}

type DetectedOs = Os | 'ios' | 'unknown';

interface Detection {
  os: DetectedOs;
  arch: Arch;
}

async function detectPlatform(): Promise<Detection> {
  const ua = navigator.userAgent;
  let os: DetectedOs = 'unknown';
  let arch: Arch = 'x64';

  const nav = navigator as Navigator & {
    userAgentData?: {
      platform: string;
      getHighEntropyValues: (hints: string[]) => Promise<{
        platform?: string;
        architecture?: string;
        bitness?: string;
      }>;
    };
  };

  if (nav.userAgentData) {
    try {
      const h = await nav.userAgentData.getHighEntropyValues([
        'platform',
        'architecture',
        'bitness',
      ]);
      const platform = (h.platform ?? nav.userAgentData.platform).toLowerCase();
      if (platform.includes('win')) os = 'windows';
      else if (platform.includes('mac')) os = 'macos';
      else if (platform.includes('android')) os = 'android';
      else if (platform.includes('linux')) os = 'linux';
      if (h.architecture === 'arm') arch = 'arm64';
    } catch {
      /* fall through to UA parsing */
    }
  }

  if (os === 'unknown') {
    if (/android/i.test(ua)) os = 'android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
    else if (/windows/i.test(ua)) os = 'windows';
    else if (/mac os x/i.test(ua)) os = 'macos';
    else if (/linux/i.test(ua)) os = 'linux';
    if (/arm64|aarch64/i.test(ua)) arch = 'arm64';
  }

  // macOS builds are universal binaries; arch detection is unnecessary
  if (os === 'macos') arch = 'universal';
  // nearly every Android phone in the target audience is arm64
  if (os === 'android') arch = 'arm64';

  return { os, arch };
}

export function DownloadButton({
  picks,
  texts,
  downloadPageHref,
  variant = 'filled',
  className,
  linuxOptions,
  androidOptions,
  githubToastMessage,
  downloadToastMessage,
}: {
  /** recommended asset per platform, computed server-side */
  picks: Partial<Record<Os, Pick>>;
  texts: {
    /** e.g. "下载" / "Download" */
    download: string;
    /** e.g. "适用于 Windows" / "for Windows" — used as `${download} ${suffix}` */
    forOs: Record<Os, string>;
    /** shown when the platform can't be detected, e.g. "前往下载页" */
    fallback: string;
  };
  downloadPageHref: string;
  variant?: 'filled' | 'tonal';
  className?: string;
  /** all Linux packages; when present, a detected Linux user gets a dropdown instead of a direct link */
  linuxOptions?: LinuxOption[];
  /** alternate Android download sources shown to detected Android users */
  androidOptions?: AndroidDownloadOption[];
  /** localized notice shown while a GitHub mirror is being measured */
  githubToastMessage?: string;
  /** localized notice shown immediately before the browser starts downloading */
  downloadToastMessage?: string;
}) {
  const [target, setTarget] = useState<{ href: string; label: string } | null>(
    null,
  );
  const [detected, setDetected] = useState<DetectedOs>('unknown');
  const [detectedArch, setDetectedArch] = useState<Arch>('x64');
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    detectPlatform().then(({ os, arch }) => {
      if (cancelled) return;
      setDetected(os);
      setDetectedArch(arch);
      const pick = os === 'ios' || os === 'unknown' ? undefined : picks[os];
      if (pick) {
        setTarget({
          href: pick.url,
          label: `${texts.download}${texts.forOs[os as Os]}`,
        });
      } else {
        setTarget({ href: downloadPageHref, label: texts.fallback });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [picks, texts, downloadPageHref]);

  const { goto } = useDownloadProxy();

  const isLinuxMenu = detected === 'linux' && (linuxOptions?.length ?? 0) > 0;
  const isAndroidMenu =
    detected === 'android' && (androidOptions?.length ?? 0) > 0;

  // filter to the detected architecture; if the filter empties the list
  // (e.g. arch detection failed), fall back to showing every package
  const filteredLinuxOptions =
    linuxOptions?.filter((o) => o.arch === detectedArch) ?? [];
  const menuOptions =
    filteredLinuxOptions.length > 0 ? filteredLinuxOptions : linuxOptions ?? [];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const el = e.target as Node;
      if (
        (btnRef.current && btnRef.current.contains(el)) ||
        (menuRef.current && menuRef.current.contains(el))
      ) {
        return;
      }
      setOpen(false);
    };
    const closeOnLayout = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', closeOnLayout);
    window.addEventListener('scroll', closeOnLayout, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', closeOnLayout);
      window.removeEventListener('scroll', closeOnLayout, true);
    };
  }, [open]);

  const toggleMenu = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    setOpen((v) => !v);
  };

  // before detection resolves, render a stable link to the download page
  const rawHref = target?.href ?? downloadPageHref;
  const label = target?.label ?? texts.download;
  // measure this exact URL right before downloading, then go through the
  // fastest mirror (never a raw GitHub download)
  const intercept = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    goto(rawHref, githubToastMessage, downloadToastMessage);
  };

  const btnClass = cn(
    'inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold no-underline',
    'transition-[background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    variant === 'filled'
      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:brightness-105'
      : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:brightness-105',
    className,
  );

  return (
    <>
      {isLinuxMenu || isAndroidMenu ? (
        <button
          ref={btnRef}
          type="button"
          onClick={toggleMenu}
          aria-haspopup="menu"
          aria-expanded={open}
          className={btnClass}
        >
          <Download className="size-5" />
          <span>{label}</span>
        </button>
      ) : (
        <a href={rawHref} onClick={intercept} className={btnClass}>
          <Download className="size-5" />
          <span>{label}</span>
        </a>
      )}

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-50 flex max-h-[60vh] min-w-52 -translate-x-1/2 flex-col overflow-y-auto rounded-2xl bg-[var(--md-sys-color-surface-container-high)] p-2 shadow-xl"
            onClick={() => setOpen(false)}
          >
            {isAndroidMenu
              ? androidOptions?.map((option) => (
                  <a
                    key={option.url}
                    href={option.url}
                    onClick={(e) => {
                      e.preventDefault();
                      goto(
                        option.url,
                        githubToastMessage,
                        option.showDownloadToast === false
                          ? undefined
                          : downloadToastMessage,
                      );
                    }}
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-fd-foreground)] no-underline hover:bg-[var(--md-sys-color-surface-container-highest)]"
                  >
                    <Download className="size-4 shrink-0 text-fd-muted-foreground" />
                    <span>{option.label}</span>
                  </a>
                ))
              : menuOptions.map((option) => (
                  <a
                    key={option.url}
                    href={option.url}
                    onClick={(e) => {
                      e.preventDefault();
                      goto(option.url, githubToastMessage, downloadToastMessage);
                    }}
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-fd-foreground)] no-underline hover:bg-[var(--md-sys-color-surface-container-highest)]"
                  >
                    <Download className="size-4 shrink-0 text-fd-muted-foreground" />
                    <span>
                      {option.format}
                      {option.archLabel ? ` · ${option.archLabel}` : ''}
                    </span>
                  </a>
                ))}
          </div>,
          document.body,
        )}
    </>
  );
}
