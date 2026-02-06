// Contract configuration for the deployed loot box system
export const CONTRACT_CONFIG = {
  // Package ID from latest deployment with NFT image support
  PACKAGE_ID: "0x06ec4cf04fd461d3f49c5c95cb92d85646c0a79de59f27b4ce0f6f5041e062d7",

  // Module name
  MODULE: "loot_box",

  // The Random object on Sui (same on all networks)
  RANDOM_OBJECT: "0x0000000000000000000000000000000000000000000000000000000000000008",

  // GameConfig shared object ID
  GAME_CONFIG_ID: "0xd0405c7277b456baeb54203713e9e62d8b30d8831770571beb5e53a220d84295",

  // Loot box price in MIST (100 = 100 MIST = 0.0000001 SUI for easy testing)
  // Change to 100_000_000_000 for 100 SUI in production
  LOOT_BOX_PRICE: 100,

  // Type for GameItem
  GAME_ITEM_TYPE: "0x06ec4cf04fd461d3f49c5c95cb92d85646c0a79de59f27b4ce0f6f5041e062d7::loot_box::GameItem",

  // Type for LootBox
  LOOT_BOX_TYPE: "0x06ec4cf04fd461d3f49c5c95cb92d85646c0a79de59f27b4ce0f6f5041e062d7::loot_box::LootBox",

  // Type for GameConfig
  GAME_CONFIG_TYPE:
    "0x06ec4cf04fd461d3f49c5c95cb92d85646c0a79de59f27b4ce0f6f5041e062d7::loot_box::GameConfig<0x2::sui::SUI>",

  // Sui Explorer base URL (testnet)
  EXPLORER_URL: "https://suiscan.xyz/testnet/object",
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
