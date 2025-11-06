// config/yourChain.ts
// Client-side configuration (uses NEXT_PUBLIC_ prefix)

// Get environment variables with defaults
// In Next.js, client-side code can only access NEXT_PUBLIC_ prefixed variables
const getEnvVar = (key: string, defaultValue: string): string => {
  // Always use NEXT_PUBLIC_ prefix for client-side access
  return process.env[`NEXT_PUBLIC_${key}`] || defaultValue;
};

// Your Custom Blockchain Configuration
export const yourChainConfig = {
  id: parseInt(getEnvVar('YOUR_CHAIN_ID', '31337')),
  name: getEnvVar('YOUR_CHAIN_NAME', 'Proof-of-Art Network'),
  network: 'proof-of-art',
  nativeCurrency: {
    name: 'POA',
    symbol: 'POA',  // Change from 'ETH' to 'POA'
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [getEnvVar('YOUR_CHAIN_RPC_URL', 'https://p01--poa-chain--wdqd5crrcgfg.code.run/')]
    },
    public: {
      http: [getEnvVar('YOUR_CHAIN_RPC_URL', 'https://p01--poa-chain--wdqd5crrcgfg.code.run/')]
    }
  },
  blockExplorers: {
    default: {
      name: 'Proof-of-Art Explorer',
      url: getEnvVar('YOUR_CHAIN_EXPLORER_URL', '')
    }
  },
  testnet: true,
  // EIP-1559: Zero gas fees configuration
  fees: {
    gasPrice: {
      slow: { gwei: '0' },
      standard: { gwei: '0' },
      fast: { gwei: '0' },
    },
  },
};

// Export RPC URLs
export const YOUR_CHAIN_RPC_URL = getEnvVar('YOUR_CHAIN_RPC_URL', 'https://p01--poa-chain--wdqd5crrcgfg.code.run/');
export const YOUR_CHAIN_LOCAL_RPC_URL = getEnvVar('YOUR_CHAIN_LOCAL_RPC_URL', 'http://127.0.0.1:8545');
export const YOUR_CHAIN_ID = parseInt(getEnvVar('YOUR_CHAIN_ID', '31337'));
export const YOUR_CHAIN_ID_HEX = getEnvVar('YOUR_CHAIN_ID_HEX', '0x7a69');
export const YOUR_TOKEN_ADDRESS = getEnvVar('YOUR_TOKEN_ADDRESS', '');

// Server-side only (no NEXT_PUBLIC_ prefix)
export const SERVER_RPC_URL = process.env.YOUR_CHAIN_RPC_URL || 'https://p01--poa-chain--wdqd5crrcgfg.code.run/';
export const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Helper function to get RPC URL based on environment
export const getRPCUrl = (): string => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? YOUR_CHAIN_LOCAL_RPC_URL : YOUR_CHAIN_RPC_URL;
};

