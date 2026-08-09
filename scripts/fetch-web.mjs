#!/usr/bin/env node
/**
 * Fetch the newest OronBox web build from GitHub Releases and unpack it into
 * public/web, so the docs site serves the current web build at /web/.
 *
 * Runs as a prebuild step. Fails soft: when the API or download is
 * unreachable the build continues without a web build (public/web stays as
 * it was or absent).
 */
import { mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = 'zxor-org/OronBox';
const API = `https://api.github.com/repos/${REPO}/releases`;
const OUT_DIR = fileURLToPath(new URL('../public/web/', import.meta.url));
const TMP_ZIP = fileURLToPath(new URL('../.tmp-web.zip', import.meta.url));
const VERSION_FILE = fileURLToPath(new URL('../public/web/.web-version', import.meta.url));

/** download mirrors, same as the site's client-side download proxy */
const MIRRORS = [
  (url) => url,
  (url) => `https://ghfast.top/${url}`,
  (url) => `https://mirror.ghproxy.com/${url}`,
];

async function readDeployedVersion() {
  try {
    return (await readFile(VERSION_FILE, 'utf8')).trim();
  } catch {
    return null;
  }
}

/** Try direct first, then mirrors; each attempt has a hard timeout. */
async function downloadBytes(url) {
  let lastErr;
  for (const wrap of MIRRORS) {
    try {
      const res = await fetch(wrap(url), {
        redirect: 'follow',
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      console.warn(`[fetch-web] source failed: ${wrap(url).slice(0, 60)}… (${err.message})`);
    }
  }
  throw lastErr ?? new Error('no download source');
}

async function main() {
  const res = await fetch(API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'OronBox-Docs' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const releases = await res.json();
  const release = Array.isArray(releases) ? releases[0] : null;
  if (!release) throw new Error('no releases found');
  const asset = (release.assets ?? []).find(
    (a) => typeof a.name === 'string' && a.name.endsWith('-web.zip'),
  );
  if (!asset) throw new Error(`no -web.zip asset in ${release.tag_name}`);

  if ((await readDeployedVersion()) === release.tag_name) {
    console.log(`[fetch-web] already at ${release.tag_name}, skipping`);
    return;
  }

  const bytes = await downloadBytes(asset.browser_download_url);
  await writeFile(TMP_ZIP, bytes);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await new Promise((resolve, reject) => {
    const p = spawn('unzip', ['-o', TMP_ZIP, '-d', OUT_DIR], { stdio: 'ignore' });
    p.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`unzip exit ${code}`)),
    );
    p.on('error', reject);
  });
  await writeFile(VERSION_FILE, `${release.tag_name}\n`);
  await rm(TMP_ZIP, { force: true });
  console.log(`[fetch-web] deployed ${release.tag_name} (${asset.name}, ${bytes.length} bytes)`);
}

main().catch((err) => {
  console.warn(`[fetch-web] skipped: ${err.message}`);
});
