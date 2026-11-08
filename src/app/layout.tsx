import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '🪔 Diwali Lanterns — Couples Trivia Game',
  description:
    'A romantic couples trivia game for Diwali! Answer questions together, light up the sky with lanterns, and celebrate your bond.',
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
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
