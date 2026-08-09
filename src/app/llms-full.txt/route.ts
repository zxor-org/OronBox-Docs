import { allPages, getLLMText } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const scanned = await Promise.all(allPages().map(getLLMText));

  return new Response(scanned.join('\n\n'));
}
