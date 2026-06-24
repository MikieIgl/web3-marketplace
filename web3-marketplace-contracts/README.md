# Web3 Marketplace - Smart Contracts

Solidity smart contracts for the decentralized marketplace.

## 🚀 Features

- **List Items** — Create listings with name, description, image, price
- **Buy Items** — Purchase with ETH
- **Reentrancy Guard** — Protected against reentrancy
- **Events** — ItemListed, ItemSold

## 🛠 Tech Stack

- **Solidity:** 0.8.20
- **Framework:** Hardhat 2.x
- **Library:** OpenZeppelin 5.x
- **Network:** Sepolia

## 📋 Prerequisites

- Node.js 18+
- npm 10+
- MetaMask + Sepolia ETH
- Alchemy RPC key

## 🚀 Quick Start

```bash
cd web3-marketplace-contracts
npm install
cp .env.example .env
# Edit .env with your RPC URL and private key
npm run compile
npm run deploy        # Deploy to Sepolia
npm run export-abi    # Export to frontend
npm run seed          # Add test items (optional)
```

## 📜 Commands

| Command              | Description           |
| -------------------- | --------------------- |
| `npm run compile`    | Compile contracts     |
| `npm run deploy`     | Deploy to Sepolia     |
| `npm run seed`       | Add test data         |
| `npm run export-abi` | Export ABI to frontend|
| `npx hardhat node`   | Local Hardhat network |

## 📁 Structure

```
├── contracts/
│   └── Marketplace.sol
├── scripts/
│   ├── deploy.ts
│   ├── seed.ts
│   └── export-abi.js
├── abi/                 # Exported ABI
├── artifacts/           # Compiled artifacts
├── .env.example
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

## 📄 Contract

### Marketplace.sol

```solidity
struct Item {
    uint256 id;
    address payable seller;
    address buyer;
    string name;
    string description;
    string imageUrl;
    uint256 price;
    bool sold;
}
```

### Functions

| Function            | Description      |
| ------------------- | ---------------- |
| `listItem(...)`     | Create listing   |
| `buyItem(id)`       | Purchase item    |
| `getAllItems()`     | Get all items    |
| `getItemsByBuyer()` | Get buyer's items|

### Events

```solidity
event ItemListed(uint256 id, address seller, string name, uint256 price);
event ItemSold(uint256 id, address buyer, address seller, uint256 price);
```

## 🔧 Config

### hardhat.config.ts

```typescript
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};
```

## 🌐 Networks

### Sepolia

- **Chain ID:** 11155111
- **Explorer:** sepolia.etherscan.io
- **Faucet:** sepoliafaucet.com

## 📊 Deployment

| Date       | Network | Address                                    |
| ---------- | ------- | ------------------------------------------ |
| 2026-06-24 | Sepolia | `0x79ec3e60860EeBb331eEf6efcCD16Fa2b4Eb39c6` |

## 🔗 Frontend Integration

After deploy:

1. Copy contract address
2. Update `../web3-marketplace/src/app/contracts/addresses.ts`
3. Run `npm run export-abi`

## 🐛 Troubleshooting

**"Insufficient funds"** — Get Sepolia ETH from faucet

**"Contract not found"** — Verify address, check network

**Timeout errors** — Check RPC URL, internet connection

## 🔗 Related

- [Frontend](../web3-marketplace/README.md)
- [Etherscan](https://sepolia.etherscan.io/address/0x79ec3e60860EeBb331eEf6efcCD16Fa2b4Eb39c6)

## 📄 License

MIT
