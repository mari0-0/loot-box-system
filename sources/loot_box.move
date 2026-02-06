/// Module: loot_box_system::loot_box
/// 
/// A loot box system where players can purchase loot boxes using fungible tokens
/// and receive randomly generated in-game items (NFTs) with varying rarity levels.
/// 
/// The randomness is verifiable and tamper-proof using Sui's native on-chain randomness.
#[allow(unused_const, lint(coin_field, self_transfer, custom_state_change))]
module loot_box::loot_box {
    // ===== Imports =====
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::random::{Self, Random};
    use sui::display;
    use sui::package::Publisher;
    use sui::dynamic_field;
    use std::string::{Self, String};

    // ===== Error Codes =====
    /// Error when payment amount is insufficient
    const EInsufficientPayment: u64 = 0;
    /// Error when caller is not the admin
    const ENotAdmin: u64 = 1;
    /// Error when rarity weights don't sum to 100
    const EInvalidWeights: u64 = 2;

    // ===== Constants =====
    /// Default price for a loot box (in token base units)
    const DEFAULT_LOOT_BOX_PRICE: u64 = 100;

    // Rarity tier constants
    const RARITY_COMMON: u8 = 0;
    const RARITY_RARE: u8 = 1;
    const RARITY_EPIC: u8 = 2;
    const RARITY_LEGENDARY: u8 = 3;

    // Default rarity weights (must sum to 100)
    const DEFAULT_COMMON_WEIGHT: u8 = 60;
    const DEFAULT_RARE_WEIGHT: u8 = 25;
    const DEFAULT_EPIC_WEIGHT: u8 = 12;
    const DEFAULT_LEGENDARY_WEIGHT: u8 = 3;

    /// Number of non-legendary opens before guaranteed Legendary
    const PITY_THRESHOLD: u64 = 30;

    // ===== One-Time-Witness =====
    /// One-time witness for claiming Publisher
    public struct LOOT_BOX has drop {}

    // ===== Init Function =====
    /// Module initializer - creates Publisher and Display for NFT rendering
    fun init(otw: LOOT_BOX, ctx: &mut TxContext) {
        // Claim publisher using the one-time witness
        let publisher = sui::package::claim(otw, ctx);
        
        // Create Display for GameItem NFTs
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"image_url"),
            string::utf8(b"description"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"{description}"),
            string::utf8(b"https://dungeon-of-relics.com"),
            string::utf8(b"Dungeon of Relics"),
        ];
        
        let mut disp = display::new_with_fields<GameItem>(&publisher, keys, values, ctx);
        display::update_version(&mut disp);
        
        // Transfer Display and Publisher to the deployer
        transfer::public_transfer(disp, ctx.sender());
        transfer::public_transfer(publisher, ctx.sender());
    }

    // ===== Structs =====

    /// Shared object storing game configuration
    /// Contains rarity weights, loot box price, and treasury
    public struct GameConfig<phantom T> has key {
        id: UID,
        /// Weight for Common rarity (0-100)
        common_weight: u8,
        /// Weight for Rare rarity (0-100)
        rare_weight: u8,
        /// Weight for Epic rarity (0-100)
        epic_weight: u8,
        /// Weight for Legendary rarity (0-100)
        legendary_weight: u8,
        /// Price to purchase one loot box
        loot_box_price: u64,
        /// Treasury collecting payments
        treasury: Coin<T>,
    }

    /// Capability granting admin privileges
    /// Holder can update game configuration
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Owned object representing an unopened loot box
    /// Must be opened to receive a GameItem
    public struct LootBox has key, store {
        id: UID,
    }

    /// NFT representing an in-game item
    /// Has rarity tier and power level determined by randomness
    public struct GameItem has key, store {
        id: UID,
        /// Name of the item
        name: String,
        /// Rarity tier (0=Common, 1=Rare, 2=Epic, 3=Legendary)
        rarity: u8,
        /// Power level within the rarity's range
        power: u8,
        /// IPFS URL for the item image
        image_url: String,
        /// Description of the item
        description: String,
    }

    // ===== Events =====

    /// Emitted when a loot box is opened
    public struct LootBoxOpened has copy, drop {
        /// ID of the minted GameItem
        item_id: ID,
        /// Rarity tier of the item
        rarity: u8,
        /// Power level of the item
        power: u8,
        /// Address of the player who opened the box
        owner: address,
    }

    // ===== Public Functions =====

    /// Initialize the game with default configuration
    /// Creates a shared GameConfig and transfers AdminCap to the caller
    /// 
    /// # Type Parameters
    /// * `T` - The fungible token type used for payments
    /// 
    /// # Arguments
    /// * `ctx` - Transaction context
    public fun init_game<T>(ctx: &mut TxContext) {
        // Create GameConfig with default weights and price
        let config = GameConfig<T> {
            id: object::new(ctx),
            common_weight: DEFAULT_COMMON_WEIGHT,
            rare_weight: DEFAULT_RARE_WEIGHT,
            epic_weight: DEFAULT_EPIC_WEIGHT,
            legendary_weight: DEFAULT_LEGENDARY_WEIGHT,
            loot_box_price: DEFAULT_LOOT_BOX_PRICE,
            treasury: coin::zero<T>(ctx),
        };
        
        // Share the GameConfig object
        transfer::share_object(config);
        
        // Create AdminCap and transfer to tx sender
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, ctx.sender());
    }

    /// Purchase a loot box by paying the required token amount
    /// 
    /// # Type Parameters
    /// * `T` - The fungible token type used for payments
    /// 
    /// # Arguments
    /// * `config` - Shared GameConfig object
    /// * `payment` - Coin used for payment (must be >= loot_box_price)
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// * `LootBox` - An unopened loot box object
    public fun purchase_loot_box<T>(
        config: &mut GameConfig<T>,
        payment: Coin<T>,
        ctx: &mut TxContext
    ): LootBox {
        // Verify payment amount >= loot_box_price
        assert!(coin::value(&payment) >= config.loot_box_price, EInsufficientPayment);
        
        // Add payment to treasury
        coin::join(&mut config.treasury, payment);
        
        // Create and return new LootBox object
        LootBox {
            id: object::new(ctx),
        }
    }

    /// Open a loot box and receive a random GameItem
    /// 
    /// IMPORTANT: This function MUST be marked as `entry` (not `public`) 
    /// to securely use on-chain randomness. This prevents the random value
    /// from being inspected by other functions before commitment.
    /// 
    /// # Type Parameters
    /// * `T` - The fungible token type used for payments
    /// 
    /// # Arguments
    /// * `config` - Shared GameConfig to read rarity weights
    /// * `loot_box` - The loot box to open (will be destroyed)
    /// * `r` - The Random object from address 0x8
    /// * `ctx` - Transaction context
    entry fun open_loot_box<T>(
        config: &mut GameConfig<T>,
        loot_box: LootBox,
        r: &Random,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();

        // Create a new RandomGenerator
        let mut gen = random::new_generator(r, ctx);
        
        // Check and update pity counter
        // If threshold reached, force Legendary
        // Else, generate random rarity
        let rarity = if (check_and_update_pity(config, sender)) {
            RARITY_LEGENDARY
        } else {
            // Generate random number 0-99 for rarity determination
            let rarity_roll = random::generate_u8_in_range(&mut gen, 0, 99);
            
            determine_rarity(
                rarity_roll,
                config.common_weight,
                config.rare_weight,
                config.epic_weight
            )
        };
        
        // If random roll resulted in Legendary (but not from pity), reset counter
        // This is handled inside check_and_update_pity for the pity case, 
        // but we need to handle the natural Legendary case
        // However, accessing dynamic fields twice might be expensive.
        // Let's refine the logic:
        // We already updated the counter in check_and_update_pity assuming a non-pity roll.
        // If we rolled a natural Legendary, we should reset the counter.
        if (rarity == RARITY_LEGENDARY) {
             reset_pity_counter(config, sender);
        };
        
        // Get power range for the determined rarity
        let (min_power, max_power) = get_power_range(rarity);
        
        // Generate power level within rarity's range
        let power = random::generate_u8_in_range(&mut gen, min_power, max_power);
        
        // Generate item name based on rarity
        let name = generate_item_name(rarity);
        
        // Generate image URL and description
        let image_url = generate_image_url(rarity);
        let description = generate_description(rarity, power);
        
        // Create GameItem with determined stats
        let item = GameItem {
            id: object::new(ctx),
            name,
            rarity,
            power,
            image_url,
            description,
        };
        
        let item_id = object::id(&item);
        let owner = ctx.sender();
        
        // Emit LootBoxOpened event
        event::emit(LootBoxOpened {
            item_id,
            rarity,
            power,
            owner,
        });
        
        // Delete the loot box
        let LootBox { id } = loot_box;
        object::delete(id);
        
        // Transfer GameItem to sender
        transfer::transfer(item, owner);
    }

    /// Get the stats of a GameItem
    /// 
    /// # Arguments
    /// * `item` - Reference to the GameItem
    /// 
    /// # Returns
    /// * `(String, u8, u8, String, String)` - Tuple of (name, rarity, power, image_url, description)
    public fun get_item_stats(item: &GameItem): (String, u8, u8, String, String) {
        (item.name, item.rarity, item.power, item.image_url, item.description)
    }

    /// Transfer a GameItem to another address
    /// 
    /// # Arguments
    /// * `item` - The GameItem to transfer
    /// * `recipient` - Address to receive the item
    public fun transfer_item(item: GameItem, recipient: address) {
        transfer::transfer(item, recipient);
    }

    /// Burn (destroy) an unwanted GameItem
    /// 
    /// # Arguments
    /// * `item` - The GameItem to destroy
    public fun burn_item(item: GameItem) {
        let GameItem { id, name: _, rarity: _, power: _, image_url: _, description: _ } = item;
        object::delete(id);
    }

    /// Update the rarity weights (admin only)
    /// 
    /// # Type Parameters
    /// * `T` - The fungible token type
    /// 
    /// # Arguments
    /// * `_admin` - AdminCap proving admin privileges
    /// * `config` - Mutable reference to GameConfig
    /// * `common` - New weight for Common rarity
    /// * `rare` - New weight for Rare rarity
    /// * `epic` - New weight for Epic rarity
    /// * `legendary` - New weight for Legendary rarity
    public fun update_rarity_weights<T>(
        _admin: &AdminCap,
        config: &mut GameConfig<T>,
        common: u8,
        rare: u8,
        epic: u8,
        legendary: u8
    ) {
        // Verify weights sum to 100
        assert!(
            (common as u16) + (rare as u16) + (epic as u16) + (legendary as u16) == 100,
            EInvalidWeights
        );
        
        // Update config with new weights
        config.common_weight = common;
        config.rare_weight = rare;
        config.epic_weight = epic;
        config.legendary_weight = legendary;
    }

    /// Update the loot box price (admin only)
    /// 
    /// # Type Parameters
    /// * `T` - The fungible token type
    /// 
    /// # Arguments
    /// * `_admin` - AdminCap proving admin privileges
    /// * `config` - Mutable reference to GameConfig
    /// * `new_price` - New price for loot boxes
    public fun update_loot_box_price<T>(
        _admin: &AdminCap,
        config: &mut GameConfig<T>,
        new_price: u64
    ) {
        config.loot_box_price = new_price;
    }

    /// Withdraw funds from the treasury (admin only)
    /// 
    /// # Type Parameters
    /// * `T` - The fungible token type
    /// 
    /// # Arguments
    /// * `_admin` - AdminCap proving admin privileges
    /// * `config` - Mutable reference to GameConfig
    /// * `amount` - Amount to withdraw
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// * `Coin<T>` - The withdrawn coins
    public fun withdraw_treasury<T>(
        _admin: &AdminCap,
        config: &mut GameConfig<T>,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<T> {
        coin::split(&mut config.treasury, amount, ctx)
    }

    // ===== Helper Functions =====

    /// Check pity counter and update it
    /// Returns true if pity threshold reached (guaranteed Legendary)
    /// Returns false otherwise
    fun check_and_update_pity<T>(config: &mut GameConfig<T>, user: address): bool {
        // Pity counter key prefix (could be just the address, but let's be safe against collisions if we add more user fields later)
        // For simplicity using address directly as key since dynamic fields distinguish by type + generic
        // Key type: address, Value type: u64
        
        if (!dynamic_field::exists_(&config.id, user)) {
            dynamic_field::add(&mut config.id, user, 0u64);
        };
        
        let counter = dynamic_field::borrow_mut<address, u64>(&mut config.id, user);
        
        if (*counter >= PITY_THRESHOLD) {
            *counter = 0; // Reset on pity trigger
            true
        } else {
            *counter = *counter + 1;
            false
        }
    }
    
    /// Reset pity counter (called when natural Legendary is rolled)
    fun reset_pity_counter<T>(config: &mut GameConfig<T>, user: address) {
        if (dynamic_field::exists_(&config.id, user)) {
            let counter = dynamic_field::borrow_mut<address, u64>(&mut config.id, user);
            *counter = 0;
        }
    }

    /// Determine rarity tier based on random roll and weights
    /// 
    /// # Arguments
    /// * `roll` - Random number 0-99
    /// * `common_weight` - Weight for Common
    /// * `rare_weight` - Weight for Rare
    /// * `epic_weight` - Weight for Epic
    /// 
    /// # Returns
    /// * `u8` - Rarity tier constant
    fun determine_rarity(roll: u8, common_weight: u8, rare_weight: u8, epic_weight: u8): u8 {
        if (roll < common_weight) {
            RARITY_COMMON
        } else if (roll < common_weight + rare_weight) {
            RARITY_RARE
        } else if (roll < common_weight + rare_weight + epic_weight) {
            RARITY_EPIC
        } else {
            RARITY_LEGENDARY
        }
    }

    /// Generate item name based on rarity
    /// 
    /// # Arguments
    /// * `rarity` - The rarity tier
    /// 
    /// # Returns
    /// * `String` - Generated item name
    fun generate_item_name(rarity: u8): String {
        if (rarity == RARITY_COMMON) {
            string::utf8(b"Common Sword")
        } else if (rarity == RARITY_RARE) {
            string::utf8(b"Rare Blade")
        } else if (rarity == RARITY_EPIC) {
            string::utf8(b"Epic Weapon")
        } else {
            string::utf8(b"Legendary Artifact")
        }
    }

    /// Generate image URL based on rarity
    /// 
    /// # Arguments
    /// * `rarity` - The rarity tier
    /// 
    /// # Returns
    /// * `String` - URL for the item image
    fun generate_image_url(rarity: u8): String {
        if (rarity == RARITY_COMMON) {
            string::utf8(b"https://i.ibb.co/bgjqND9P/common-sword.png")
        } else if (rarity == RARITY_RARE) {
            string::utf8(b"https://i.ibb.co/p6gnzVLm/rare-blade.png")
        } else if (rarity == RARITY_EPIC) {
            string::utf8(b"https://i.ibb.co/HfBJh1bF/epic-weapon.png")
        } else {
            string::utf8(b"https://i.ibb.co/j9zkv3ms/legendary-artifact.png")
        }
    }

    /// Generate description based on rarity and power
    /// 
    /// # Arguments
    /// * `rarity` - The rarity tier
    /// * `power` - The power level
    /// 
    /// # Returns
    /// * `String` - Description of the item
    fun generate_description(rarity: u8, _power: u8): String {
        let rarity_name = if (rarity == RARITY_COMMON) {
            b"Common"
        } else if (rarity == RARITY_RARE) {
            b"Rare"
        } else if (rarity == RARITY_EPIC) {
            b"Epic"
        } else {
            b"Legendary"
        };
        
        let mut desc = string::utf8(b"A ");
        string::append(&mut desc, string::utf8(rarity_name));
        string::append(&mut desc, string::utf8(b" item from Dungeon of Relics with power level "));
        // Note: power is stored as u8, description shows rarity level
        desc
    }

    /// Create Display object for GameItem NFTs
    /// This enables wallets to render the NFT with image and metadata
    /// Call this once after publishing the package
    /// 
    /// # Arguments
    /// * `publisher` - The Publisher object received when publishing
    /// * `ctx` - Transaction context
    public fun create_display(publisher: &Publisher, ctx: &mut TxContext) {
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"image_url"),
            string::utf8(b"description"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"{description}"),
            string::utf8(b"https://dungeon-of-relics.com"),
            string::utf8(b"Dungeon of Relics"),
        ];
        
        let mut disp = display::new_with_fields<GameItem>(publisher, keys, values, ctx);
        display::update_version(&mut disp);
        transfer::public_transfer(disp, ctx.sender());
    }

    /// Calculate power range based on rarity
    /// 
    /// # Arguments
    /// * `rarity` - The rarity tier
    /// 
    /// # Returns
    /// * `(u8, u8)` - Tuple of (min_power, max_power)
    fun get_power_range(rarity: u8): (u8, u8) {
        if (rarity == RARITY_COMMON) {
            (1, 10)
        } else if (rarity == RARITY_RARE) {
            (11, 25)
        } else if (rarity == RARITY_EPIC) {
            (26, 40)
        } else {
            (41, 50)
        }
    }

    // ===== Getter Functions =====

    /// Get the current loot box price
    public fun get_loot_box_price<T>(config: &GameConfig<T>): u64 {
        config.loot_box_price
    }

    /// Get all rarity weights
    public fun get_rarity_weights<T>(config: &GameConfig<T>): (u8, u8, u8, u8) {
        (config.common_weight, config.rare_weight, config.epic_weight, config.legendary_weight)
    }

    /// Get the treasury balance
    public fun get_treasury_balance<T>(config: &GameConfig<T>): u64 {
        coin::value(&config.treasury)
    }

    // ===== Test-only Functions =====

    #[test_only]
    /// Create a GameItem for testing purposes
    public fun create_test_item(
        name: String,
        rarity: u8,
        power: u8,
        ctx: &mut TxContext
    ): GameItem {
        GameItem {
            id: object::new(ctx),
            name,
            rarity,
            power,
            image_url: generate_image_url(rarity),
            description: generate_description(rarity, power),
        }
    }

    #[test_only]
    /// Get rarity constants for testing
    public fun get_rarity_common(): u8 { RARITY_COMMON }
    
    #[test_only]
    public fun get_rarity_rare(): u8 { RARITY_RARE }
    
    #[test_only]
    public fun get_rarity_epic(): u8 { RARITY_EPIC }
    
    #[test_only]
    public fun get_rarity_legendary(): u8 { RARITY_LEGENDARY }

    #[test_only]
    /// Expose determine_rarity for testing
    public fun test_determine_rarity(roll: u8, common: u8, rare: u8, epic: u8): u8 {
        determine_rarity(roll, common, rare, epic)
    }
}