import { defineI18n } from 'fumadocs-core/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';

export const i18n = defineI18n({
  languages: ['zh', 'en'],
  defaultLanguage: 'zh',
  hideLocale: 'default-locale',
  parser: 'dot',
});

export const i18nUI = defineI18nUI(i18n, {
  zh: { displayName: '中文' },
  en: { displayName: 'English' },
});

/** Adds the locale prefix for non-default languages (zh URLs stay bare). */
export function withLocale(lang: string, path: string) {
  return lang === i18n.defaultLanguage ? path : `/${lang}${path}`;
}
