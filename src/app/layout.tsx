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
  metadataBase: new URL('https://nipponbox.com.br'),
  title: {
    default: 'NipponBox — Compras do Japão para o Brasil',
    template: '%s | NipponBox',
  },
  description:
    'A NipponBox é sua ponte direta para o Japão. Compre em qualquer loja japonesa, consolide seus pacotes em nosso armazém em Tóquio e envie para o Brasil com segurança e economia.',
  keywords: [
    'proxy shopping japão',
    'redirecionamento japão brasil',
    'comprar no japão',
    'mercari brasil',
    'amazon jp brasil',
    'consolidar encomendas',
    'importação japão',
  ],
  authors: [{ name: 'NipponBox Team' }],
  creator: 'NipponBox',
  publisher: 'NipponBox',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'NipponBox — Compras do Japão para o Brasil',
    description:
      'A ponte direta para o Japão. Compre de qualquer loja japonesa como se estivesse em Tóquio. Armazenamento gratuito e envio expresso.',
    url: 'https://nipponbox.com.br',
    siteName: 'NipponBox',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NipponBox — Sua ponte para o Japão',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NipponBox — Compras do Japão para o Brasil',
    description: 'Compre no Japão e receba no Brasil. Logística simplificada e segura.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  );
}
