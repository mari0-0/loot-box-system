# Fix: UpgradeCap Ownership Issue

## Problem
The UpgradeCap is owned by a different address than your current active address.

- **UpgradeCap Owner**: `0x334255e1c45f7949fe40fe5e8f24f5fefc3af87a5529519b26b1244d5b33d0f7`
- **Current Active Address**: `0x887568af89de8634b7b2c6ddd2f377e5617fad5d53195388cf425affd018e423`

## Solution Options

### Option 1: Switch to the Correct Address (Recommended)

If you have access to the address that owns the UpgradeCap:

```bash
# List all addresses in your Sui client
sui client addresses

# Switch to the address that owns the UpgradeCap
sui client switch --address 0x334255e1c45f7949fe40fe5e8f24f5fefc3af87a5529519b26b1244d5b33d0f7

# Verify the switch
sui client active-address

# Make sure this address has gas
sui client gas

# Now run the upgrade
sui client upgrade \
  --upgrade-capability 0x256f120dd61d897dc2066099e2f862c74100b61087c4d12dffbd9bb48b902456 \
  --gas-budget 100000000
```

### Option 2: Publish a New Package

If you don't have access to the original address, you can publish a new package:

```bash
# Remove the published entry from Published.toml
# Edit Published.toml and remove or comment out the [published.testnet] section

# Then publish fresh
sui client publish --gas-budget 100000000
```

**Note:** This will create a NEW package ID, so you'll need to:
1. Update `ui/src/config.js` with the new Package ID
2. Re-initialize the game (if needed)
3. Users will need to interact with the new contract

### Option 3: Transfer the UpgradeCap (If You Have Access)

If you have access to the original address but want to use a different one:

```bash
# First switch to the owner address
sui client switch --address 0x334255e1c45f7949fe40fe5e8f24f5fefc3af87a5529519b26b1244d5b33d0f7

# Transfer the UpgradeCap to your current address
sui client transfer \
  --object-id 0x256f120dd61d897dc2066099e2f862c74100b61087c4d12dffbd9bb48b902456 \
  --to 0x887568af89de8634b7b2c6ddd2f377e5617fad5d53195388cf425affd018e423 \
  --gas-budget 10000000

# Then switch back and upgrade
sui client switch --address 0x887568af89de8634b7b2c6ddd2f377e5617fad5d53195388cf425affd018e423
sui client upgrade \
  --upgrade-capability 0x256f120dd61d897dc2066099e2f862c74100b61087c4d12dffbd9bb48b902456 \
  --gas-budget 100000000
```

## Recommended Approach

**Option 1** is usually the best if you have access to the original address, as it:
- Keeps the same Package ID (no frontend changes needed)
- Preserves all existing game state
- Is the simplest solution
