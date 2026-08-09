'use client';

import { firstResponding, isGitHubUrl } from '@/lib/download-proxy';

/**
 * No page-load speed test: the fastest mirror is chosen right before each
 * download by HEAD-probing that concrete URL. Non-GitHub links go straight.
 */
export function useDownloadProxy() {
  /** Measure the URL, then navigate through the fastest mirror. */
  const goto = (url: string) => {
    if (!isGitHubUrl(url)) {
      window.location.href = url;
      return;
    }
    firstResponding(url).then((candidate) => {
      window.location.href = candidate.wrap(url);
    });
  };

  return { goto };
}
