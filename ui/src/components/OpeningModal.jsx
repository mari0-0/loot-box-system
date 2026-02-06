import { RARITY, TREASURE_BOX } from "../config";

export default function OpeningModal({ openingState, treasureBoxFrame, revealedItem, particles, onClose }) {
  if (!openingState) return null;

  const rarityInfo = revealedItem ? RARITY[revealedItem.rarity] : null;

  const rarityTextColors = {
    common: "text-rarity-common border-rarity-common",
    rare: "text-rarity-rare border-rarity-rare",
    epic: "text-rarity-epic border-rarity-epic",
    legendary: "text-rarity-legendary border-rarity-legendary",
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-1000">
      <div className="text-center relative p-8">
        {openingState !== "revealing" ? (
          <div
            className={`w-80 h-80 flex items-center justify-center text-[10rem] relative ${openingState === "intense" ? "" : "animate-shake"}`}
          >
            <div className="absolute -inset-16 opacity-0" />
            <img src={TREASURE_BOX.FRAMES[treasureBoxFrame]} alt="Opening Box" className="w-4/5 h-4/5 object-contain" />
          </div>
        ) : (
          revealedItem && (
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

              {/* Revealed Item */}
              <div
                className={`animate-reveal p-8 border-4 border-text-primary bg-bg-card shadow-[inset_-8px_-8px_0_rgba(0,0,0,0.4),8px_8px_0_rgba(0,0,0,0.6)]`}
              >
                <img
                  src={rarityInfo.icon}
                  alt={rarityInfo.name}
                  className="w-32 h-32 mx-auto mb-6 [image-rendering:pixelated] drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                />
                <div className="text-[1rem] font-normal mb-4 leading-relaxed">{revealedItem.name}</div>
                <div
                  className={`text-[0.8rem] font-normal uppercase tracking-wider mb-4 py-2 px-4 border-2 inline-block ${rarityTextColors[rarityInfo.class]} ${rarityInfo.class === "legendary" ? "animate-blink" : ""}`}
                >
                  {rarityInfo.name}
                </div>
                <div className="text-[0.9rem] text-text-secondary mt-4">⚡ Power: {revealedItem.power}</div>
              </div>

              {/* Close Button */}
              <button
                className="mt-8 px-8 py-4 bg-accent-success border-4 border-text-primary text-text-primary font-normal text-[0.7rem] font-pixel uppercase shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.2),4px_4px_0_rgba(0,0,0,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),inset_4px_4px_0_rgba(255,255,255,0.2),2px_2px_0_rgba(0,0,0,0.5)]"
                onClick={onClose}
              >
                Collect Item
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
