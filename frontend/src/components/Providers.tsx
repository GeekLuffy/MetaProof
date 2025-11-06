'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Suppress console errors and warnings from third-party packages (only once)
if (typeof window !== 'undefined' && !(window as any).__CONSOLE_SUPPRESSED__) {
  (window as any).__CONSOLE_SUPPRESSED__ = true;
  
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress WalletConnect/Reown config errors
    if (message.includes('Failed to fetch remote project configuration') ||
        message.includes('HTTP status code: 403') ||
        message.includes('your_walletconnect_project_id') ||
        message.includes('projectId=your_walletconnect_project_id')) {
      return;
    }
    // Suppress WalletConnect Core initialization warnings
    if (message.includes('WalletConnect Core is already initialized')) {
      return;
    }
    // Suppress Lit dev mode warnings
    if (message.includes('Lit is in dev mode') || message.includes('multiple versions of Lit')) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress WalletConnect/Reown warnings
    if (message.includes('WalletConnect') || message.includes('Reown')) {
      return;
    }
    // Suppress Lit warnings
    if (message.includes('Lit')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'Proof-of-Art',
  projectId: projectId || '00000000000000000000000000000000', // Use dummy ID if not set to avoid errors
  chains: [polygonAmoy, polygon],
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

