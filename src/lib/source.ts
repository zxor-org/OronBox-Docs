import { aboutDocs, creatorDocs, pluginDocs, userDocs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { i18n } from './i18n';
import type { SectionSlug } from './shared';

const plugins = [lucideIconsPlugin()];

export const userSource = loader({
  baseUrl: '/user',
  source: userDocs.toFumadocsSource(),
  i18n,
  plugins,
});
export const creatorSource = loader({
  baseUrl: '/creator',
  source: creatorDocs.toFumadocsSource(),
  i18n,
  plugins,
});
export const pluginSource = loader({
  baseUrl: '/plugins',
  source: pluginDocs.toFumadocsSource(),
  i18n,
  plugins,
});
export const aboutSource = loader({
  baseUrl: '/about',
  source: aboutDocs.toFumadocsSource(),
  i18n,
  plugins,
});

/** All pages of every section, for search indexes and llms.txt. */
export function allPages() {
  return [
    userSource.getPages(),
    creatorSource.getPages(),
    pluginSource.getPages(),
    aboutSource.getPages(),
  ].flat();
}

export function getSectionSource(section: SectionSlug) {
  switch (section) {
    case 'user':
      return userSource;
    case 'creator':
      return creatorSource;
    case 'plugins':
      return pluginSource;
    case 'about':
      return aboutSource;
  }
}

type LLMPage = {
  url: string;
  data: {
    title: string;
    getText: (type: 'processed') => Promise<string>;
  };
};

export async function getLLMText(page: LLMPage) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
