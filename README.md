# Web3 Marketplace

Децентрализованный маркетплейс для покупки и продажи цифровых товаров на блокчейне Ethereum.

## 📁 Структура проекта

```
SRW6/
├── .gitignore
├── README.md
├── web3-marketplace/              # Frontend (Angular 21+)
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/          # Страницы
│   │   │   │   ├── marketplace/   # Витрина с пагинацией
│   │   │   │   ├── sell/          # Создание лота
│   │   │   │   ├── my-items/      # Мои лоты
│   │   │   │   ├── sold/          # Проданные лоты
│   │   │   │   ├── portfolio/     # Купленные лоты
│   │   │   │   └── product/       # Детали лота
│   │   │   ├── core/
│   │   │   │   ├── models/        # Типы и интерфейсы
│   │   │   │   └── services/      # Wallet, Contract сервисы
│   │   │   ├── contracts/
│   │   │   │   ├── abis/          # ABI контрактов
│   │   │   │   └── addresses.ts   # Адреса контрактов
│   │   │   ├── app.html           # Layout
│   │   │   ├── app.less           # Стили layout
│   │   │   └── app.routes.ts      # Маршруты
│   │   └── styles.less
│   ├── package.json
│   └── README.md
│
└── web3-marketplace-contracts/    # Smart Contracts (Hardhat)
    ├── contracts/
    │   └── Marketplace.sol
    ├── scripts/
    │   ├── deploy.ts              # Деплой
    │   ├── seed.ts                # Тестовые данные
    │   └── export-abi.js          # Экспорт ABI
    ├── abi/                       # Скомпилированные ABI
    ├── package.json
    └── README.md
```

## 🚀 Быстрый старт

### 1. Контракты

```bash
cd web3-marketplace-contracts
npm install
npm run compile
npm run deploy        # Деплой на Sepolia
npm run export-abi    # Экспорт ABI во frontend
```

### 2. Frontend

```bash
cd web3-marketplace
npm install
npm start             # http://localhost:4200
```

## 📋 Требования

- Node.js 18+
- npm 10+
- MetaMask
- Sepolia ETH

## 🎨 Особенности

- **Angular 21+** — Signals, standalone components
- **Apple Design** — Минималистичный UI
- **Wallet Integration** — Авто-подключение, переключение аккаунтов
- **Read-only доступ** — Просмотр без кошелька

## 🔗 Контракт

- **Сеть:** Sepolia (Chain ID: 11155111)
- **Адрес:** `0x79ec3e60860EeBb331eEf6efcCD16Fa2b4Eb39c6`
- [Etherscan](https://sepolia.etherscan.io/address/0x79ec3e60860EeBb331eEf6efcCD16Fa2b4Eb39c6)

## 📄 Документация

- [Frontend README](web3-marketplace/README.md)
- [Contracts README](web3-marketplace-contracts/README.md)

## 📄 License

MIT
