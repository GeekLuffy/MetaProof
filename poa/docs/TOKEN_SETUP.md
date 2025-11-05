# POA Token Setup Guide

This guide covers deploying and using the POA ERC-20 token on the Proof-of-Art Network.

## Token Specifications

- **Name**: POA
- **Symbol**: POA
- **Decimals**: 18
- **Standard**: ERC-20
- **Initial Supply**: 1,000,000 POA (configurable)
- **Features**: Minting, Burning, Standard ERC-20 functions

## Prerequisites

1. Network is running (see [NETWORK_SETUP.md](NETWORK_SETUP.md))
2. You have a funded account
3. Dependencies are installed

## Deploying POA Token

### Local Deployment

```bash
npm run deploy:local
```

This will:
1. Deploy the POA token contract
2. Mint the initial supply to the deployer
3. Save deployment info to `deployments/localhost.json`
4. Save the contract ABI to `deployments/POAToken-abi.json`
5. Display token information

### Cloud Deployment

```bash
npm run deploy:cloud
```

Make sure you have:
1. Set `CLOUD_RPC_URL` in `.env`
2. Set `PRIVATE_KEY` in `.env`
3. Funded the deployer account

## Deployment Output

After successful deployment, you'll see:

```
Starting POA Token deployment...
Network: localhost
Deploying with account: 0x...
Account balance: 100.0 ETH

Deploying POAToken contract...
POAToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Token Information:
Name: POA
Symbol: POA
Decimals: 18
Total Supply: 1000000.0 POA
Owner: 0x...

Deployment info saved to: deployments/localhost.json
ABI saved to: deployments/POAToken-abi.json

✅ Deployment completed successfully!
```

## Adding POA Token to MetaMask

1. Open MetaMask
2. Switch to Proof-of-Art Network
3. Click "Import tokens"
4. Select "Custom token"
5. Enter the contract address (from deployment output)
6. Token symbol (POA) and decimals (18) should auto-fill
7. Click "Add Custom Token"
8. Confirm

## Using POA Token

### Contract Functions

#### Standard ERC-20 Functions

```solidity
// Get balance
function balanceOf(address account) public view returns (uint256)

// Transfer tokens
function transfer(address to, uint256 amount) public returns (bool)

// Approve spender
function approve(address spender, uint256 amount) public returns (bool)

// Transfer from
function transferFrom(address from, address to, uint256 amount) public returns (bool)

// Get allowance
function allowance(address owner, address spender) public view returns (uint256)

// Get total supply
function totalSupply() public view returns (uint256)
```

#### POA-Specific Functions

```solidity
// Mint new tokens (owner only)
function mint(address to, uint256 amount) public onlyOwner

// Burn tokens
function burn(uint256 amount) public

// Burn from account (requires allowance)
function burnFrom(address from, uint256 amount) public

// Get balance in whole tokens
function balanceOfInTokens(address account) public view returns (uint256)

// Get total supply in whole tokens
function totalSupplyInTokens() public view returns (uint256)
```

### Using with ethers.js

```javascript
const { ethers } = require('ethers');

// Load deployment info
const deployment = require('./deployments/localhost.json');
const abi = require('./deployments/POAToken-abi.json');

// Connect to network
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Create contract instance
const poaToken = new ethers.Contract(
  deployment.address,
  abi,
  signer
);

// Get balance
const balance = await poaToken.balanceOf(signer.address);
console.log('Balance:', ethers.formatUnits(balance, 18), 'POA');

// Transfer tokens
const tx = await poaToken.transfer(
  '0xRecipientAddress',
  ethers.parseUnits('100', 18) // 100 POA
);
await tx.wait();
console.log('Transfer complete!');

// Mint tokens (owner only)
const mintTx = await poaToken.mint(
  '0xRecipientAddress',
  100 // Will mint 100 POA (function handles decimals)
);
await mintTx.wait();
console.log('Minted 100 POA');
```

### Using with web3.js

```javascript
const Web3 = require('web3');

const web3 = new Web3('http://127.0.0.1:8545');

// Load deployment info
const deployment = require('./deployments/localhost.json');
const abi = require('./deployments/POAToken-abi.json');

// Create contract instance
const poaToken = new web3.eth.Contract(abi, deployment.address);

// Get balance
const balance = await poaToken.methods.balanceOf(account).call();
console.log('Balance:', web3.utils.fromWei(balance, 'ether'), 'POA');

// Transfer tokens
await poaToken.methods
  .transfer('0xRecipientAddress', web3.utils.toWei('100', 'ether'))
  .send({ from: account });
```

### Using in React/Next.js with Wagmi

```javascript
import { useContractRead, useContractWrite } from 'wagmi';
import { poaTokenAddress, poaTokenABI } from 'proof-of-art-network';

function POABalance({ address }) {
  const { data: balance } = useContractRead({
    address: poaTokenAddress,
    abi: poaTokenABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return (
    <div>
      Balance: {balance ? formatUnits(balance, 18) : '0'} POA
    </div>
  );
}

function POATransfer() {
  const { write } = useContractWrite({
    address: poaTokenAddress,
    abi: poaTokenABI,
    functionName: 'transfer',
  });

  const handleTransfer = () => {
    write({
      args: ['0xRecipientAddress', parseUnits('100', 18)],
    });
  };

  return (
    <button onClick={handleTransfer}>
      Send 100 POA
    </button>
  );
}
```

## Exporting Configuration

After deployment, export the configuration for use in other projects:

```bash
npm run export:config
```

This updates `index.js` with:
- Network configuration
- POA token address
- POA token ABI
- Helper functions

## Using in Other Projects

### Install Package

```bash
npm install proof-of-art-network
```

### Import Configuration

```javascript
const {
  networkConfig,
  poaTokenAddress,
  poaTokenABI,
  localRPCUrl
} = require('proof-of-art-network');

console.log('POA Token:', poaTokenAddress);
console.log('Network:', networkConfig.name);
```

### Example Integration

```javascript
// In your Wagmi config
import { createConfig, http } from 'wagmi';
import { networkConfig, localRPCUrl } from 'proof-of-art-network';

const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(localRPCUrl),
  },
});

// Using POA token
import { poaTokenAddress, poaTokenABI } from 'proof-of-art-network';

const { data } = useContractRead({
  address: poaTokenAddress,
  abi: poaTokenABI,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

## Token Administration

### Minting Tokens (Owner Only)

```javascript
// Only the contract owner can mint
const mintTx = await poaToken.mint(
  recipientAddress,
  amount // In whole tokens (function handles decimals)
);
await mintTx.wait();
```

### Burning Tokens

```javascript
// Burn your own tokens
const burnTx = await poaToken.burn(
  amount // In whole tokens
);
await burnTx.wait();

// Burn from another account (requires allowance)
const burnFromTx = await poaToken.burnFrom(
  fromAddress,
  amount
);
await burnFromTx.wait();
```

### Transferring Ownership

```javascript
// Transfer contract ownership
const transferOwnershipTx = await poaToken.transferOwnership(
  newOwnerAddress
);
await transferOwnershipTx.wait();
```

## Customizing Token Supply

Edit the `INITIAL_SUPPLY` environment variable before deployment:

```bash
# In .env
INITIAL_SUPPLY=5000000  # 5 million POA
```

Or specify during deployment:

```bash
INITIAL_SUPPLY=10000000 npm run deploy:local
```

## Security Considerations

1. **Owner Key Security**: Keep the owner private key secure
2. **Minting Control**: Only the owner can mint tokens
3. **Approve Carefully**: Be cautious with approve() amounts
4. **Production Keys**: Never use development keys in production
5. **Audit**: Consider auditing the contract before mainnet deployment

## Troubleshooting

### Deployment Failed

1. Check if network is running: `curl http://127.0.0.1:8545`
2. Verify account has ETH
3. Check environment variables
4. Review error messages

### Token Not Showing in MetaMask

1. Verify you're on the correct network
2. Check the contract address
3. Try removing and re-adding the token
4. Check if deployment was successful

### Transaction Failed

1. Check token balance
2. Verify allowance (for transferFrom)
3. Ensure recipient address is valid
4. Check gas limits

## Next Steps

- [Deploy to Cloud](CLOUD_SETUP.md)
- [Integration Examples](DEPLOYMENT.md)
- [Cloud Provider Guides](PROVIDERS.md)

## Resources

- [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/erc20)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Wagmi Documentation](https://wagmi.sh/)

