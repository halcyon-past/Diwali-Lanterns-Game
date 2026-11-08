import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '🪔 Diwali Lanterns — Couples Trivia & Skyline Game',
  description:
    'A romantic couples trivia game for Diwali! Answer questions together, light up the night skyline with glowing lanterns, and download your animated memory.',
  keywords: ['diwali', 'couples game', 'trivia', 'lanterns', 'romantic game'],
  openGraph: {
    title: '🪔 Diwali Lanterns — Couples Trivia Game',
    description: 'Light up the Diwali sky together! A couples trivia game.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#060112] text-[#fff8f0] overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
