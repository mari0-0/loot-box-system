# 📋 Deployment IDs Reference

This file contains all important IDs from the contract deployment for easy reference.

## Package Information

**Package ID:** `0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459`

**Transaction Digest (Publish):** `FwYtHDhvM9QBWDCR8sJKU3JBVMxLLSTjiV6rHNhoQRJ8`

**Transaction Digest (Init Game):** `8JA9kMyJDf9FFHHrQZNGWk2NFcBKnHYgY7VAJRMydyNM`

**Network:** Testnet

**Deployment Date:** February 16, 2026

---

## Contract Objects

### GameConfig (Shared Object)
**Object ID:** `0xadba0b3ac8b2241516d7de2fa8eacc2d2601c17c56f1f1bf59119c57d4e721d3`

**Type:** `0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::GameConfig<0x2::sui::SUI>`

**Status:** Shared Object (accessible by all)

**Created:** Transaction `8JA9kMyJDf9FFHHrQZNGWk2NFcBKnHYgY7VAJRMydyNM`

---

### AdminCap (Owned Object)
**Object ID:** `0x7d511cd929ba904ebdb60311dda9bd47c5f3285348995aaac3819bd340e00a3f`

**Type:** `0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::AdminCap`

**Owner:** `0x887568af89de8634b7b2c6ddd2f377e5617fad5d53195388cf425affd018e423`

**Purpose:** Grants admin privileges to update game configuration

**Created:** Transaction `8JA9kMyJDf9FFHHrQZNGWk2NFcBKnHYgY7VAJRMydyNM`

---

### UpgradeCap (Owned Object)
**Object ID:** `0xb45705f5390df0b375f52ba7e4f339c7fdbcd32a24ac4fc5696f528aa5bfdf93`

**Type:** `0x2::package::UpgradeCap`

**Owner:** `0x887568af89de8634b7b2c6ddd2f377e5617fad5d53195388cf425affd018e423`

**Purpose:** Allows upgrading the package in the future

**Created:** Transaction `FwYtHDhvM9QBWDCR8sJKU3JBVMxLLSTjiV6rHNhoQRJ8`

---

## Display & Publisher Objects

### Display Object
**Object ID:** `0xa899e8c002292a59a9f8519bbbb29280228a413b27825f3395a1c91c6575395e`

**Type:** `0x2::display::Display<0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::GameItem>`

**Purpose:** Enables NFT metadata display in wallets

**Created:** Transaction `FwYtHDhvM9QBWDCR8sJKU3JBVMxLLSTjiV6rHNhoQRJ8`

### Publisher Object
**Object ID:** `0x4613d3abd4c8435aa9e527f3c59ff9865899e61a74af91d86eeea8fa70d93d3c`

**Type:** `0x2::package::Publisher`

**Purpose:** Used to create and manage Display objects

**Created:** Transaction `FwYtHDhvM9QBWDCR8sJKU3JBVMxLLSTjiV6rHNhoQRJ8`

---

## Account Information

**Deployer Address:** `0x887568af89de8634b7b2c6ddd2f377e5617fad5d53195388cf425affd018e423`

---

## Explorer Links

### Package
- **Testnet Explorer:** https://suiscan.xyz/testnet/object/0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459

### GameConfig
- **Testnet Explorer:** https://suiscan.xyz/testnet/object/0xadba0b3ac8b2241516d7de2fa8eacc2d2601c17c56f1f1bf59119c57d4e721d3

### Transactions
- **Publish Transaction:** https://suiscan.xyz/testnet/tx/FwYtHDhvM9QBWDCR8sJKU3JBVMxLLSTjiV6rHNhoQRJ8
- **Init Game Transaction:** https://suiscan.xyz/testnet/tx/8JA9kMyJDf9FFHHrQZNGWk2NFcBKnHYgY7VAJRMydyNM

---

## Type References

### GameItem Type
```
0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::GameItem
```

### LootBox Type
```
0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::LootBox
```

### GameConfig Type
```
0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::GameConfig<0x2::sui::SUI>
```

---

## Constants

**Random Object:** `0x0000000000000000000000000000000000000000000000000000000000000008` (Same on all networks)

**Loot Box Price:** 100 MIST (0.0000001 SUI)

---

## Notes

- All objects are on Sui Testnet
- The GameConfig is a shared object, accessible by all users
- AdminCap allows updating game configuration (rarity weights, prices, etc.)
- UpgradeCap allows upgrading the package without changing the Package ID
- Display object enables proper NFT rendering in wallets
