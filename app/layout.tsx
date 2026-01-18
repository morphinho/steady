import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata: Metadata = {
  title: 'Steady',
  description: 'Focus your money. Gerencie suas finanças pessoais e de negócios',
  icons: {
    icon: [
      { url: '/steady fav.svg', type: 'image/svg+xml' },
      { url: '/steady fav.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [
      { url: '/steady fav.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Steady',
  },
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Steady" />
        <link rel="apple-touch-icon" href="/steady fav.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
