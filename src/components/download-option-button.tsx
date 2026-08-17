'use client';

import { Download } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDownloadProxy } from '@/hooks/use-download-proxy';
import type { Arch, DownloadOption } from '@/lib/releases';

const archLabels: Record<Arch, string> = {
  x64: 'x86_64',
  arm64: 'arm64',
  armv7: 'armeabi-v7a',
  universal: '',
  any: '',
};

/** Android uses the ABI names as published by Google Play / gradle */
const androidArchLabels: Record<Arch, string> = {
  x64: 'x86_64',
  arm64: 'arm64-v8a',
  armv7: 'armeabi-v7a',
  universal: '',
  any: '',
};

export function DownloadOptionButton({
  option,
  recommended,
  recommendedLabel,
  githubToastMessage,
  downloadToastMessage,
}: {
  option: DownloadOption;
  recommended: boolean;
  recommendedLabel: string;
  githubToastMessage?: string;
  downloadToastMessage?: string;
}) {
  const { goto } = useDownloadProxy();

  return (
    <a
      href={option.url}
      onClick={(e) => {
        e.preventDefault();
        goto(option.url, githubToastMessage, downloadToastMessage);
      }}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium no-underline',
        'transition-[background-color,color,border-radius,transform,box-shadow] duration-300',
        'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        recommended
          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
          : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--color-fd-foreground)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)]',
      )}
    >
      <Download className="size-4" />
      <span>
        {option.format}
        {option.os === 'android' && androidArchLabels[option.arch]
          ? ` · ${androidArchLabels[option.arch]}`
          : archLabels[option.arch]
            ? ` · ${archLabels[option.arch]}`
            : ''}
      </span>
      {recommended && (
        <span className="rounded-full bg-[var(--md-sys-color-on-primary)]/20 px-2 py-0.5 text-xs font-semibold">
          {recommendedLabel}
        </span>
      )}
    </a>
  );
}
