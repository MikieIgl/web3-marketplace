# Web3 Marketplace - Frontend

Angular-based decentralized marketplace for buying and selling digital items on the Ethereum blockchain.

## 🚀 Features

- **List Items** — Create listings with URL or file upload
- **Buy Items** — Purchase with ETH on Sepolia
- **My Items** — Your active listings
- **Sold Items** — Sales history with stats
- **Portfolio** — Items you own
- **Wallet Integration** — Auto-connect, account switching
- **Apple Design** — Clean, minimal UI

## 🛠 Tech Stack

- **Framework:** Angular 21+
- **Styling:** LESS + CSS Variables
- **Web3:** ethers.js v6
- **Build:** Angular CLI (esbuild)
- **TypeScript:** ES2022, bundler

## 📋 Prerequisites

- Node.js 18+
- npm 10+
- MetaMask
- Sepolia ETH

## 🚀 Quick Start

```bash
cd web3-marketplace
npm install
npm start             # http://localhost:4200
npm run build         # Production build
```

Contract address pre-configured in `src/app/contracts/addresses.ts`.

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── product.model.ts
│   │   └── services/
│   │       ├── wallet.service.ts
│   │       └── contract.service.ts
│   ├── features/
│   │   ├── marketplace/
│   │   ├── sell/
│   │   ├── my-items/
│   │   ├── sold/
│   │   ├── portfolio/
│   │   └── product/
│   ├── contracts/
│   │   ├── abis/
│   │   │   └── marketplace.abi.json
│   │   └── addresses.ts
│   ├── app.html
│   ├── app.less
│   ├── app.routes.ts
│   └── app.config.ts
├── styles.less
├── polyfills.ts
└── index.html
```

## 🎨 Design System

### Colors

```less
--apple-blue: #007aff --apple-green: #34c759 --apple-red: #ff3b30 --apple-gray-50: #f9f9fb
  --apple-gray-100: #f2f2f7 --apple-gray-200: #e5e5ea --apple-gray-400: #8e8e93
  --apple-gray-500: #6c6c70 --apple-gray-900: #1d1d1f;
```

### Layout

- **Header:** 56px (sticky, dark)
- **Footer:** Auto-height (dark, fixed to bottom)
- **Content Max-Width:** 1104px
- **H1:** 22px

## 🔌 Web3

### Wallet

- Auto-connect on load
- Account switch → redirect to `/marketplace`
- Disconnect → redirect to `/marketplace`

### Contract

- **Read-only:** Browse without wallet
- **Write:** Connect required (buy, list)
- **Error handling:** User-friendly messages

## 🐛 Troubleshooting

**"Unable to connect to marketplace"**

- Check MetaMask installed
- Verify Sepolia network (11155111)
- Check contract address

**"Cannot buy your own item"**

- Contract prevents self-purchase

**Build errors**

- Ensure `polyfills.ts` in `angular.json`

## 📝 Contract Functions

| Function            | Description    |
| ------------------- | -------------- |
| `getAllItems()`     | All items      |
| `listItem(...)`     | Create listing |
| `buyItem(id)`       | Purchase item  |
| `getItemsByBuyer()` | Items by owner |

## 🔗 Related

- [Contracts](../web3-marketplace-contracts/README.md)
- [Etherscan](https://sepolia.etherscan.io/address/0x79ec3e60860EeBb331eEf6efcCD16Fa2b4Eb39c6)

## 📄 License

MIT
