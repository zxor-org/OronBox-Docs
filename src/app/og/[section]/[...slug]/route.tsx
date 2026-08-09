import { getSectionSource } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName, sections } from '@/lib/shared';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ section: string; slug: string[] }> },
) {
  const { section, slug } = await params;
  if (!sections.some((entry) => entry.slug === section)) notFound();
  const page = getSectionSource(
    section as (typeof sections)[number]['slug'],
  ).getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site={appName}
    />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return sections.flatMap((section) =>
    getSectionSource(section.slug)
      .getPages()
      .map((page) => ({
        section: section.slug,
        slug: [...page.slugs, 'image.png'],
      })),
  );
}
