# 🆕 Fresh Package Publishing Guide

The old package entry has been removed from `Published.toml`. You can now publish a completely fresh package.

## Step 1: Build the Contract

```bash
cd /Users/raj/Downloads/loot-box-system
sui move build
```

This should compile successfully without errors.

## Step 2: Publish Fresh Package

```bash
sui client publish --gas-budget 100000000
```

**After publishing, you'll see output like:**
```
Transaction Digest: <TRANSACTION_DIGEST>
Published Objects:
  - PackageID: 0x<YOUR_NEW_PACKAGE_ID>
  - UpgradeCap: 0x<UPGRADE_CAP_ID>
```

**⚠️ IMPORTANT:** Copy the **Package ID** - you'll need it in the next step!

## Step 3: Initialize the Game

After publishing, initialize the game to create the GameConfig:

```bash
sui client call \
  --package <YOUR_NEW_PACKAGE_ID> \
  --module loot_box \
  --function init_game \
  --type-args 0x2::sui::SUI \
  --gas-budget 10000000
```

Copy the **GameConfig ID** (Shared Object) from the "Created Objects" section.

## Step 4: Update Frontend Configuration

Update `ui/src/config.js` with your new IDs:

```javascript
export const CONTRACT_CONFIG = {
  // Update with your NEW Package ID
  PACKAGE_ID: "0x<YOUR_NEW_PACKAGE_ID>",
  
  // Update with your NEW GameConfig ID
  GAME_CONFIG_ID: "0x<YOUR_NEW_GAME_CONFIG_ID>",
  
  // Update these type references too
  GAME_ITEM_TYPE: "0x<YOUR_NEW_PACKAGE_ID>::loot_box::GameItem",
  LOOT_BOX_TYPE: "0x<YOUR_NEW_PACKAGE_ID>::loot_box::LootBox",
  GAME_CONFIG_TYPE: "0x<YOUR_NEW_PACKAGE_ID>::loot_box::GameConfig<0x2::sui::SUI>",
  
  // These stay the same
  RANDOM_OBJECT: "0x0000000000000000000000000000000000000000000000000000000000000008",
  LOOT_BOX_PRICE: 100,
  // ... rest
};
```

## Step 5: Test the Application

```bash
cd ui
npm run dev
```

Open http://localhost:5173 and test:
- ✅ Purchase loot boxes
- ✅ Open individual boxes
- ✅ **Open All** button (new feature!)

---

**Note:** This is a completely fresh deployment, so:
- Old game state won't be available
- Users will need to interact with the new contract
- All previous loot boxes and items are on the old contract
