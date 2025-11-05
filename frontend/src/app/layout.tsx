import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Proof-of-Art | Blockchain AI Art Verification',
  description: 'The world\'s first blockchain-verified creative provenance system for AI-generated art. Own your creativity. Prove your originality.',
  keywords: ['blockchain', 'AI art', 'NFT', 'verification', 'Web3', 'proof-of-art'],
  authors: [{ name: 'Proof-of-Art Team' }],
  openGraph: {
    title: 'Proof-of-Art | Blockchain AI Art Verification',
    description: 'Own your creativity. Prove your originality.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

