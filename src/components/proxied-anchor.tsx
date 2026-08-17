'use client';

import type { ReactNode } from 'react';
import { useDownloadProxy } from '@/hooks/use-download-proxy';

/**
 * An anchor whose href is routed through the fastest GitHub mirror once the
 * silent speed test resolves. Falls back to the raw URL until then, and
 * intercepts early clicks so they still go through the mirror.
 */
export function ProxiedAnchor({
  href,
  className,
  children,
  githubToastMessage,
  downloadToastMessage,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  githubToastMessage?: string;
  downloadToastMessage?: string;
}) {
  const { goto } = useDownloadProxy();

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        goto(href, githubToastMessage, downloadToastMessage);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
