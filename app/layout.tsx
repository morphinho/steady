import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata: Metadata = {
  title: 'Steady',
  description: 'Focus your money. Gerencie suas finanças pessoais e de negócios',
  icons: {
    icon: '/steady fav.svg',
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
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
