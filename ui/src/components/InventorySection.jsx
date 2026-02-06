import { RARITY } from "../config";
import ItemCard from "./ItemCard";
import LootBoxCard from "./LootBoxCard";

export default function InventorySection({
  lootBoxes,
  inventory,
  isLoading,
  account,
  rarityFilter,
  onFilterChange,
  onOpenLootBox,
  onItemClick,
  openingState,
}) {
  const filteredInventory =
    rarityFilter === "all" ? inventory : inventory.filter(item => RARITY[item.rarity].class === rarityFilter);

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Unopened Loot Boxes */}
      {lootBoxes.length > 0 && (
        <section className="mt-16">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-[1.5rem] font-normal text-text-primary [text-shadow:3px_3px_0_var(--color-bg-primary),-1px_-1px_0_var(--color-accent-primary)] tracking-wider">
              Unopened Loot Boxes
            </h2>
            <span className="text-text-secondary bg-bg-card px-4 py-2 border-4 border-text-muted text-[0.75rem] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),2px_2px_0_rgba(0,0,0,0.4)]">
              {lootBoxes.length} boxes
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-8">
            {lootBoxes.map(box => (
              <LootBoxCard key={box.id} box={box} onOpen={onOpenLootBox} disabled={!!openingState} />
            ))}
          </div>
        </section>
      )}

      {/* Inventory Section */}
      <section className="mt-16 mb-16">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="text-[1.5rem] font-normal text-text-primary [text-shadow:3px_3px_0_var(--color-bg-primary),-1px_-1px_0_var(--color-accent-primary)] tracking-wider">
            Your Inventory
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary bg-bg-card px-4 py-2 border-4 border-text-muted text-[0.75rem] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),2px_2px_0_rgba(0,0,0,0.4)]">
              {filteredInventory.length} items
            </span>
            <select
              className="bg-bg-card text-text-primary border-4 border-text-muted py-2 pl-4 pr-8 font-pixel text-[0.6rem] cursor-pointer shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),2px_2px_0_rgba(0,0,0,0.4)] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width=%2712%27%20height=%278%27%20viewBox=%270%200%2012%208%27%20fill=%27none%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M1%201L6%206L11%201%27%20stroke=%27%23f4e4c1%27%20stroke-width=%272%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.5rem_center] hover:bg-bg-hover hover:-translate-x-px hover:-translate-y-px focus:outline-2 focus:outline-accent-primary focus:outline-offset-2"
              value={rarityFilter}
              onChange={e => onFilterChange(e.target.value)}
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 bg-bg-card border-4 border-dashed border-text-muted shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 border-[3px] border-bg-primary border-t-text-primary border-r-text-primary animate-spin-slow mx-auto" />
            <p className="text-text-secondary text-[0.7rem] leading-relaxed mt-4">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-16 bg-bg-card border-4 border-dashed border-text-muted shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)]">
            <div className="text-6xl mb-4 opacity-50 grayscale">📦</div>
            <p className="text-text-secondary text-[0.7rem] leading-relaxed">
              {rarityFilter !== "all"
                ? `No ${rarityFilter} items found. Try a different filter!`
                : account
                  ? "No items yet. Purchase a loot box to get started!"
                  : "Connect your wallet to view your inventory"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-8">
            {filteredInventory.map((item, index) => (
              <ItemCard key={item.id} item={item} animationDelay={index * 0.1} onClick={() => onItemClick(item.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
