import { RARITY, TREASURE_BOX } from "../config";

export default function OpeningModal({ openingState, treasureBoxFrame, revealedItem, particles, onClose, onCancel, canCancel = true }) {
  if (!openingState) return null;

  // Check if revealedItem is an array (bulk open) or single item
  const isMultipleItems = Array.isArray(revealedItem);
  const items = isMultipleItems ? revealedItem : revealedItem ? [revealedItem] : [];

  // Get the highest rarity for particles (already set in App.jsx for bulk)
  const rarityInfo = items.length > 0 ? RARITY[items[0].rarity] : null;

  const rarityTextColors = {
    common: "text-rarity-common border-rarity-common",
    rare: "text-rarity-rare border-rarity-rare",
    epic: "text-rarity-epic border-rarity-epic",
    legendary: "text-rarity-legendary border-rarity-legendary",
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-1000 overflow-y-auto">
      <div className="text-center relative p-8">
        {openingState !== "revealing" ? (
          <div className="relative">
            <div
              className={`w-80 h-80 flex items-center justify-center text-[10rem] relative ${openingState === "intense" ? "" : "animate-shake"}`}
            >
              <div className="absolute -inset-16 opacity-0" />
              <img src={TREASURE_BOX.FRAMES[treasureBoxFrame]} alt="Opening Box" className="w-4/5 h-4/5 object-contain" />
            </div>
            
            {/* Cancel Button - only show during animation, before transaction */}
            {canCancel && onCancel && (
              <button
                type="button"
                className="mt-6 px-6 py-3 bg-accent-error border-4 border-text-primary text-text-primary font-normal text-[0.7rem] font-pixel uppercase shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.2),4px_4px_0_rgba(0,0,0,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.2),2px_2px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1"
                onClick={onCancel}
              >
                ✕ Cancel
              </button>
            )}
          </div>
        ) : (
          items.length > 0 && (
            <div className="relative p-8">
              {/* Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                  <div
                    key={p.id}
                    className="absolute w-2.5 h-2.5 rounded-full animate-particle-float"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: p.size,
                      height: p.size,
                      background: p.color,
                      "--tx": `${p.tx}px`,
                      animationDelay: `${p.delay}s`,
                    }}
                  />
                ))}
              </div>

              {/* Title for bulk open */}
              {isMultipleItems && (
                <h2 className="text-[1.5rem] font-normal mb-6 text-text-primary [text-shadow:3px_3px_0_var(--color-bg-primary),-1px_-1px_0_var(--color-accent-primary)] tracking-wider">
                  🎉 {items.length} Items Revealed!
                </h2>
              )}

              {/* Revealed Items - Grid for multiple, single for one */}
              <div className={isMultipleItems ? "grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl" : ""}>
                {items.map((item, index) => {
                  const itemRarityInfo = RARITY[item.rarity];
                  return (
                    <div
                      key={item.id || index}
                      className={`animate-reveal p-6 border-4 border-text-primary bg-bg-card shadow-[inset_-8px_-8px_0_rgba(0,0,0,0.4),8px_8px_0_rgba(0,0,0,0.6)] ${isMultipleItems ? "" : "p-8"}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <img
                        src={itemRarityInfo.icon}
                        alt={itemRarityInfo.name}
                        className={`mx-auto mb-4 [image-rendering:pixelated] drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] ${isMultipleItems ? "w-20 h-20" : "w-32 h-32 mb-6"}`}
                      />
                      <div className={`font-normal mb-2 leading-relaxed ${isMultipleItems ? "text-[0.7rem]" : "text-[1rem] mb-4"}`}>
                        {item.name}
                      </div>
                      <div
                        className={`font-normal uppercase tracking-wider mb-2 py-1 px-3 border-2 inline-block ${rarityTextColors[itemRarityInfo.class]} ${itemRarityInfo.class === "legendary" ? "animate-blink" : ""} ${isMultipleItems ? "text-[0.6rem]" : "text-[0.8rem] mb-4 py-2 px-4"}`}
                      >
                        {itemRarityInfo.name}
                      </div>
                      <div className={`text-text-secondary ${isMultipleItems ? "text-[0.65rem] mt-2" : "text-[0.9rem] mt-4"}`}>
                        ⚡ Power: {item.power}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <button
                className="mt-8 px-8 py-4 bg-accent-success border-4 border-text-primary text-text-primary font-normal text-[0.7rem] font-pixel uppercase shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.2),4px_4px_0_rgba(0,0,0,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.2),2px_2px_0_rgba(0,0,0,0.5)]"
                onClick={onClose}
              >
                {isMultipleItems ? `Collect ${items.length} Items` : "Collect Item"}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
