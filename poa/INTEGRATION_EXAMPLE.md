# Proof-of-Art Network - Example Integration

This example shows how to integrate Proof-of-Art Network and POA token in your project.

## Installation

```bash
npm install proof-of-art-network wagmi viem @tanstack/react-query
```

## Configuration

### wagmi.config.js

```javascript
import { http, createConfig } from 'wagmi';
import { networkConfig, cloudRPCUrl, localRPCUrl } from 'proof-of-art-network';

// Use cloud RPC in production, local in development
const rpcUrl = process.env.NODE_ENV === 'production' ? cloudRPCUrl : localRPCUrl;

export const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(rpcUrl),
  },
});
```

## Components

### POABalance.jsx

```javascript
import { useContractRead, useAccount } from 'wagmi';
import { poaTokenAddress, poaTokenABI } from 'proof-of-art-network';
import { formatUnits } from 'viem';

export function POABalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading } = useContractRead({
    address: poaTokenAddress,
    abi: poaTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  if (!address) return <div>Connect wallet to see balance</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Your POA Balance</h3>
      <p>{balance ? formatUnits(balance, 18) : '0'} POA</p>
    </div>
  );
}
```

### POATransfer.jsx

```javascript
import { useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { poaTokenAddress, poaTokenABI } from 'proof-of-art-network';
import { parseUnits } from 'viem';

export function POATransfer() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const { write, data: writeData } = useContractWrite({
    address: poaTokenAddress,
    abi: poaTokenABI,
    functionName: 'transfer',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  const handleTransfer = () => {
    if (!recipient || !amount) return;
    
    write({
      args: [recipient, parseUnits(amount, 18)],
    });
  };

  return (
    <div>
      <h3>Transfer POA</h3>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button 
        onClick={handleTransfer}
        disabled={isLoading}
      >
        {isLoading ? 'Transferring...' : 'Transfer'}
      </button>
      {isSuccess && <p>Transfer successful!</p>}
    </div>
  );
}
```

### App.jsx

```javascript
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi.config';
import { POABalance } from './components/POABalance';
import { POATransfer } from './components/POATransfer';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <h1>Proof-of-Art Network Demo</h1>
          <POABalance />
          <POATransfer />
        </div>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
```

## Using with ethers.js

```javascript
import { ethers } from 'ethers';
import { 
  poaTokenAddress, 
  poaTokenABI, 
  cloudRPCUrl 
} from 'proof-of-art-network';

// Connect to network
const provider = new ethers.JsonRpcProvider(cloudRPCUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Create contract instance
const poaToken = new ethers.Contract(
  poaTokenAddress,
  poaTokenABI,
  wallet
);

// Get balance
async function getBalance(address) {
  const balance = await poaToken.balanceOf(address);
  return ethers.formatUnits(balance, 18);
}

// Transfer tokens
async function transfer(to, amount) {
  const tx = await poaToken.transfer(
    to,
    ethers.parseUnits(amount.toString(), 18)
  );
  const receipt = await tx.wait();
  return receipt;
}

// Example usage
async function main() {
  const myAddress = await wallet.getAddress();
  console.log('My address:', myAddress);
  
  const balance = await getBalance(myAddress);
  console.log('POA balance:', balance);
  
  // Transfer 100 POA
  await transfer('0xRecipientAddress', '100');
  console.log('Transfer complete!');
}

main().catch(console.error);
```

## Adding Network to MetaMask

```javascript
async function addNetworkToMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7a69', // 31337 in hex
          chainName: 'Proof-of-Art Network',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://your-domain.com:8545'],
          blockExplorerUrls: null
        }]
      });
      console.log('Network added to MetaMask');
    } catch (error) {
      console.error('Error adding network:', error);
    }
  }
}
```

## Adding POA Token to MetaMask

```javascript
import { poaTokenAddress } from 'proof-of-art-network';

async function addPOATokenToMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: poaTokenAddress,
            symbol: 'POA',
            decimals: 18,
          }
        }
      });
      console.log('POA token added to MetaMask');
    } catch (error) {
      console.error('Error adding token:', error);
    }
  }
}
```

## Complete Example

See the full example in the `examples/` directory of the repository.

