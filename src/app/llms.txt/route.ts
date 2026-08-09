import { allPages } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const lines = allPages().map(
    (page) =>
      `- [${page.data.title}](${page.url}): ${page.data.description ?? ''}`,
  );

  return new Response(`# OronBox Docs\n\n${lines.join('\n')}\n`);
}
