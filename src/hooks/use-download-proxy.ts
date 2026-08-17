'use client';

import { firstResponding, isGitHubUrl } from '@/lib/download-proxy';
import { announceDownloadToast } from '@/components/download-toast';

/**
 * No page-load speed test: the fastest mirror is chosen right before each
 * download by HEAD-probing that concrete URL. Non-GitHub links go straight.
 */
export function useDownloadProxy() {
  /** Measure the URL, then navigate through the fastest mirror. */
  const goto = (
    url: string,
    githubToastMessage = 'GitHub镜像测速中...',
    downloadToastMessage?: string,
  ) => {
    const startDownload = (target: string) => {
      if (downloadToastMessage) announceDownloadToast(downloadToastMessage);
      window.setTimeout(() => {
        window.location.href = target;
      }, 120);
    };

    if (!isGitHubUrl(url)) {
      startDownload(url);
      return;
    }
    announceDownloadToast(githubToastMessage);
    firstResponding(url).then((candidate) => {
      startDownload(candidate.wrap(url));
    });
  };

  return { goto };
}
