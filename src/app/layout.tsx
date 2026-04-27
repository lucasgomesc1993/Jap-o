import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jost = Jost({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NipponBox — Compras do Japão para o Brasil',
  description:
    'Compre qualquer produto japonês com segurança. Proxy shopping e redirecionamento do Japão para o Brasil com frete consolidado e rastreamento completo.',
  keywords: ['proxy shopping', 'japão', 'brasil', 'compras japão', 'NipponBox', 'redirecionamento'],
  openGraph: {
    title: 'NipponBox — Compras do Japão para o Brasil',
    description:
      'Compre qualquer produto japonês com segurança. Frete consolidado e rastreamento completo.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
