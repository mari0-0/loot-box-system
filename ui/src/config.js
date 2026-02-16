// Contract configuration for the deployed loot box system
export const CONTRACT_CONFIG = {
  // Package ID from latest deployment with bulk_open_loot_boxes function
  PACKAGE_ID: "0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459",

  // Module name
  MODULE: "loot_box",

  // The Random object on Sui (same on all networks)
  RANDOM_OBJECT: "0x0000000000000000000000000000000000000000000000000000000000000008",

  // GameConfig shared object ID
  GAME_CONFIG_ID: "0xadba0b3ac8b2241516d7de2fa8eacc2d2601c17c56f1f1bf59119c57d4e721d3",

  // Loot box price in MIST (100 = 100 MIST = 0.0000001 SUI for easy testing)
  // Change to 100_000_000_000 for 100 SUI in production
  LOOT_BOX_PRICE: 100,

  // Type for GameItem
  GAME_ITEM_TYPE: "0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::GameItem",

  // Type for LootBox
  LOOT_BOX_TYPE: "0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::LootBox",

  // Type for GameConfig
  GAME_CONFIG_TYPE:
    "0x851540cb644526d668e03870d3703026e24a2d816b8ca845993e85c80371a459::loot_box::GameConfig<0x2::sui::SUI>",

  // Sui Explorer base URL (testnet)
  EXPLORER_URL: "https://suiscan.xyz/testnet/object",

  // Mobile App Links
  MOBILE_APP_LINKS: {
    IOS: "https://apps.apple.com/app/slush-wallet/id123456789", // Replace with actual ID
    ANDROID: "https://play.google.com/store/apps/details?id=com.slushwallet", // Replace with actual ID
  },
};

// Rarity constants matching the Move contract
export const RARITY = {
  0: {
    name: "Common",
    class: "common",
    icon: "/assets/rewards/common_sword.png",
    color: "#7aa5d2",
  },
  1: {
    name: "Rare",
    class: "rare",
    icon: "/assets/rewards/rare_blade.png",
    color: "#6abe30",
  },
  2: {
    name: "Epic",
    class: "epic",
    icon: "/assets/rewards/epic_weapon.png",
    color: "#ac3232",
  },
  3: {
    name: "Legendary",
    class: "legendary",
    icon: "/assets/rewards/legendary_artifact.png",
    color: "#d77bba",
  },
};

// Treasure box animation frames
//metal
export const TREASURE_BOX = {
  FRAMES: [
    "/assets/treasure_box/metal/00.png",
    "/assets/treasure_box/metal/01.png",
    "/assets/treasure_box/metal/02.png",
    "/assets/treasure_box/metal/03.png",
    "/assets/treasure_box/metal/04.png",
    "/assets/treasure_box/metal/05.png",
    "/assets/treasure_box/metal/06.png",
    "/assets/treasure_box/metal/07.png",
    "/assets/treasure_box/metal/08.png",
    "/assets/treasure_box/metal/09.png",
    "/assets/treasure_box/metal/10.png",
  ],
  FRAME_DURATION: 100, // ms per frame
};

//wooden
// export const TREASURE_BOX = {
//   FRAMES: [
//     "/assets/treasure_box/wooden/00.png",
//     "/assets/treasure_box/wooden/01.png",
//     "/assets/treasure_box/wooden/02.png",
//     "/assets/treasure_box/wooden/03.png",
//     "/assets/treasure_box/wooden/04.png",
//   ],
//   FRAME_DURATION: 100, // ms per frame
// };

// Animation timing constants
export const ANIMATION = {
  SHAKE_DURATION: 2000,
  INTENSE_SHAKE_DURATION: 1500,
  REVEAL_DELAY: 500,
  PARTICLE_COUNT: 20,
};
