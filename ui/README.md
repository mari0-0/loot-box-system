# Dungeon of Relics - Loot Box Arena UI

A pixel-art themed web interface for the Sui blockchain loot box system. Purchase mystery loot boxes and discover rare NFT items with unique powers!

## Features

- 🎮 **Pixel Art Theme** - Retro dungeon-inspired design with custom animations
- 📦 **Loot Box System** - Purchase and open mystery boxes to receive NFT items
- 🎲 **Rarity Tiers** - Common, Rare, Epic, and Legendary items with different drop rates
- 👛 **Wallet Integration** - Connect your Sui wallet to interact with the blockchain
- 🖼️ **NFT Display** - View your inventory with item images and stats
- 🔗 **Explorer Links** - Quick access to view transactions on Sui Explorer

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool with HMR
- **TailwindCSS v4** - Styling with custom pixel-art theme
- **@mysten/dapp-kit** - Sui wallet connection and transactions
- **@mysten/sui** - Sui blockchain client

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Sui wallet (Sui Wallet, Suiet, etc.)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Configuration

Update `src/config.js` with your deployed contract addresses:

```javascript
export const CONTRACT_CONFIG = {
  PACKAGE_ID: "0x...", // Your deployed package ID
  GAME_CONFIG_ID: "0x...", // GameConfig shared object ID
  // ... other settings
};
```

## Project Structure

```
ui/
├── src/
│   ├── assets/           # Images, videos, and static files
│   ├── components/       # React components
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   ├── ShopSection.jsx
│   │   ├── InventorySection.jsx
│   │   ├── OpeningModal.jsx
│   │   └── Toast.jsx
│   ├── App.jsx           # Main application
│   ├── config.js         # Contract configuration
│   └── index.css         # Global styles and theme
└── index.html
```

## Smart Contract

The UI interacts with the `loot_box` Move module deployed on Sui testnet. Key functions:

- `purchase_loot_box` - Buy a loot box using SUI tokens
- `open_loot_box` - Open a loot box to receive a random GameItem NFT

## License

MIT
