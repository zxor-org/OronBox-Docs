import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

const docs = {
  schema: pageSchema,
  postprocess: {
    includeProcessedMarkdown: true,
  },
} as const;
const meta = { schema: metaSchema } as const;

export const userDocs = defineDocs({ dir: 'content/user', docs, meta });
export const creatorDocs = defineDocs({ dir: 'content/creator', docs, meta });
export const pluginDocs = defineDocs({ dir: 'content/plugins', docs, meta });
export const aboutDocs = defineDocs({ dir: 'content/about', docs, meta });

export default defineConfig({
  mdxOptions: {},
});
