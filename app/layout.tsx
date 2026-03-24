import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'VIRTUAL STUDIO | Ensaios com IA',
  description: 'A Nova Era da Fotografia Profissional. Transforme suas fotos em obras de arte.',
  openGraph: {
    title: 'VIRTUAL STUDIO | Ensaios com IA',
    description: 'A Nova Era da Fotografia Profissional. Transforme suas fotos em obras de arte.',
    url: 'https://virtualstudio.click',
    siteName: 'Virtual Studio',
    images: [
      {
        url: '/logo.2.png',
        width: 800,
        height: 600,
        alt: 'Virtual Studio Logo',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIRTUAL STUDIO | Ensaios com IA',
    description: 'A Nova Era da Fotografia Profissional. Transforme suas fotos em obras de arte.',
    images: ['/logo.2.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="bg-[#171510] text-white font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
