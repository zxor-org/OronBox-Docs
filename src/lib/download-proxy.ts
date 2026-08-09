/**
 * GitHub release-asset mirror selection.
 *
 * There is no page-load speed test. Right before a download starts, a HEAD
 * probe is fired at every candidate for that concrete asset URL; the first
 * candidate to respond wins and the real download goes through it. Non-GitHub
 * and in-site links never go through a mirror.
 */

export interface ProxyCandidate {
  name: string;
  /** rewrites a github.com URL to go through this candidate */
  wrap: (url: string) => string;
}

const CANDIDATES: ProxyCandidate[] = [
  { name: 'direct', wrap: (url) => url },
  { name: 'ghfast', wrap: (url) => `https://ghfast.top/${url}` },
  { name: 'ghproxy', wrap: (url) => `https://mirror.ghproxy.com/${url}` },
];

/**
 * Fire a HEAD probe at every candidate for one concrete URL; the first
 * candidate that responds successfully wins and is used for the download.
 * No timeouts — when every candidate fails, fall back to direct.
 */
export async function firstResponding(url: string): Promise<ProxyCandidate> {
  return new Promise((resolve) => {
    let pending = CANDIDATES.length;
    let settled = false;
    const done = (candidate: ProxyCandidate) => {
      if (settled) return;
      settled = true;
      resolve(candidate);
    };
    for (const candidate of CANDIDATES) {
      fetch(candidate.wrap(url), {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      })
        .then(() => done(candidate))
        .catch(() => {
          if (--pending === 0) done(CANDIDATES[0]);
        });
    }
  });
}

/** Whether a mirror can meaningfully rewrite this URL. */
export function isGitHubUrl(url: string) {
  return /^https?:\/\/github\.com\//.test(url);
}
