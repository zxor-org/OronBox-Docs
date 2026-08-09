import { RootProvider } from 'fumadocs-ui/provider/next';
import '../global.css';
import { i18n, i18nUI } from '@/lib/i18n';

export const metadata = {
  icons: {
    icon: [
      { url: '/icon.svg', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      {/* Brand webfont from the jsdelivr CDN (Google Fonts / gstatic are
          unreachable from some networks; .font-brand falls back to system).
          precedence lets React 19 hoist the stylesheet into <head>. */}
      <link
        rel="stylesheet"
        precedence="default"
        href="https://cdn.jsdelivr.net/npm/@fontsource/google-sans-flex@5.3.1/600.css"
      />
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={i18nUI.provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
