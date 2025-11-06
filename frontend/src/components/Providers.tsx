'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { yourChainConfig, YOUR_CHAIN_ID, YOUR_CHAIN_ID_HEX } from '@/config/yourChain';
import type { Chain } from 'viem';

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
    // Suppress expected blockchain contract errors (contract not deployed, no data, etc.)
    if (message.includes('returned no data') ||
        message.includes('not a contract') ||
        message.includes('does not have the function') ||
        message.includes('ContractFunctionExecutionError') ||
        message.includes('ContractFunctionZeroDataError')) {
      return; // These are expected when contract isn't deployed or no artworks registered
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

// Define custom chain for wagmi (using Chain type from viem)
const customChain = {
  id: YOUR_CHAIN_ID,
  name: yourChainConfig.name,
  nativeCurrency: yourChainConfig.nativeCurrency,
  rpcUrls: {
    default: {
      http: yourChainConfig.rpcUrls.default.http as [string, ...string[]],
    },
    public: {
      http: yourChainConfig.rpcUrls.public.http as [string, ...string[]],
    },
  },
  blockExplorers: yourChainConfig.blockExplorers.default.url
    ? {
        default: {
          name: yourChainConfig.blockExplorers.default.name,
          url: yourChainConfig.blockExplorers.default.url,
        },
      }
    : undefined,
  testnet: yourChainConfig.testnet,
  // EIP-1559: Zero gas fees configuration
  fees: {
    gasPrice: {
      slow: { gwei: '0' },
      standard: { gwei: '0' },
      fast: { gwei: '0' },
    },
  },
} as Chain;

const config = getDefaultConfig({
  appName: 'Proof-of-Art',
  projectId: projectId || '00000000000000000000000000000000', // Use dummy ID if not set to avoid errors
  chains: [customChain],
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

