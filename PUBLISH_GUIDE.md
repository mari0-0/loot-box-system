# 📦 Publishing the Loot Box Smart Contract

This guide will walk you through publishing your updated smart contract to Sui Testnet (or Mainnet).

## Prerequisites

1. **Install Sui CLI** (if not already installed):
   ```bash
   # Install via cargo (recommended)
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
   
   # OR install via package manager
   # macOS
   brew install sui
   
   # Linux
   curl -fsSL https://get.sui.io | sh
   ```

2. **Set up Sui Client**:
   ```bash
   # Initialize Sui client (if first time)
   sui client
   
   # Switch to testnet (or mainnet)
   sui client switch --env testnet
   
   # Check active address
   sui client active-address
   
   # Make sure you have testnet SUI tokens for gas
   # Get testnet tokens: https://docs.sui.io/guides/developer/getting-started/get-coins
   ```

## Step 1: Build the Contract

First, verify the contract builds successfully:

```bash
cd /Users/raj/Downloads/loot-box-system
sui move build
```

This should compile without errors. If you see any errors, fix them before proceeding.

## Step 2: Run Tests (Optional but Recommended)

```bash
sui move test
```

Ensure all tests pass, especially tests related to the new `bulk_open_loot_boxes` function.

## Step 3: Publish the Contract

### For Testnet:

```bash
sui client publish --gas-budget 100000000
```

### For Mainnet:

```bash
sui client publish --gas-budget 100000000 --env mainnet
```

**What happens:**
1. The CLI will compile your Move package
2. It will prompt you to approve the transaction
3. After successful publishing, you'll see output like:

```
Transaction Digest: <TRANSACTION_DIGEST>
Published Objects:
  - PackageID: 0x<YOUR_NEW_PACKAGE_ID>
  - UpgradeCap: 0x<UPGRADE_CAP_ID>
```

**⚠️ IMPORTANT:** Copy the **Package ID** - you'll need it for the next steps!

## Step 4: Initialize the Game (If First Time Deployment)

If this is a fresh deployment (not an upgrade), you need to initialize the game:

```bash
sui client call \
  --package <YOUR_NEW_PACKAGE_ID> \
  --module loot_box \
  --function init_game \
  --type-args 0x2::sui::SUI \
  --gas-budget 10000000
```

Copy the **GameConfig ID** (Shared Object) from the "Created Objects" section.

## Step 5: Update Frontend Configuration

Update `ui/src/config.js` with your new package ID:

```javascript
export const CONTRACT_CONFIG = {
  // Update this with your new Package ID
  PACKAGE_ID: "0x<YOUR_NEW_PACKAGE_ID>",
  
  // Update this if you initialized a new game
  GAME_CONFIG_ID: "0x<YOUR_GAME_CONFIG_ID>",
  
  // Random object is the same on all networks
  RANDOM_OBJECT: "0x0000000000000000000000000000000000000000000000000000000000000008",
  
  // ... rest of config
};
```

## Step 6: Verify the Deployment

You can verify your contract on Sui Explorer:

- **Testnet**: https://suiscan.xyz/testnet/object/<YOUR_PACKAGE_ID>
- **Mainnet**: https://suiscan.xyz/mainnet/object/<YOUR_PACKAGE_ID>

## Troubleshooting

### Error: "Insufficient gas"
- Get more testnet tokens: https://docs.sui.io/guides/developer/getting-started/get-coins
- Increase gas budget: `--gas-budget 200000000`

### Error: "Package already published"
- If you're upgrading, use `sui client upgrade` instead (requires UpgradeCap)
- Or publish with a different address

### Error: "Module not found" or compilation errors
- Run `sui move build` to see detailed error messages
- Ensure all dependencies are correct in `Move.toml`

## Upgrading an Existing Contract

If you're upgrading an existing contract and have the UpgradeCap:

```bash
sui client upgrade \
  --upgrade-capability <UPGRADE_CAP_ID> \
  --gas-budget 100000000
```

The UpgradeCap ID can be found in your `Published.toml` file or from the original publish transaction.

## Next Steps

After publishing:
1. ✅ Update `ui/src/config.js` with new Package ID
2. ✅ Test the "Open All" functionality
3. ✅ Verify all events are emitted correctly
4. ✅ Test the bulk open with multiple boxes

---

**Need help?** Check the [Sui Documentation](https://docs.sui.io/) or [Sui Discord](https://discord.gg/sui)
