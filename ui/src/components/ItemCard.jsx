import { RARITY } from "../config";

export default function ItemCard({ item, onClick, animationDelay = 0 }) {
  const rarityInfo = RARITY[item.rarity];

  const rarityBorderColors = {
    common: "border-rarity-common",
    rare: "border-rarity-rare",
    epic: "border-rarity-epic",
    legendary: "border-rarity-legendary",
  };

  const rarityTextColors = {
    common: "text-rarity-common border-rarity-common",
    rare: "text-rarity-rare border-rarity-rare",
    epic: "text-rarity-epic border-rarity-epic",
    legendary: "text-rarity-legendary border-rarity-legendary",
  };

  return (
    <div
      className={`bg-bg-card border-4 ${rarityBorderColors[rarityInfo.class]} p-6 relative overflow-hidden shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.4),4px_4px_0_rgba(0,0,0,0.5)] animate-fade-in-up hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.4),6px_6px_0_rgba(0,0,0,0.5)] cursor-pointer ${rarityInfo.class === "legendary" ? "animate-pulse-glow" : ""}`}
      style={{
        animationDelay: `${animationDelay}s`,
        "--glow-color": rarityInfo.class === "legendary" ? "var(--color-rarity-legendary-glow)" : undefined,
      }}
      onClick={onClick}
      title="Click to view in Sui Explorer"
    >
      {/* Inner border */}
      <div
        className={`absolute inset-2 border-2 ${rarityBorderColors[rarityInfo.class]} pointer-events-none ${rarityInfo.class === "legendary" ? "shadow-[inset_0_0_20px_var(--color-rarity-legendary-glow)]" : ""}`}
      />

      <img
        src={rarityInfo.icon}
        alt={rarityInfo.name}
        className="block w-16 h-16 mx-auto mb-4 [image-rendering:pixelated] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"
      />

      <div className="text-[0.7rem] font-normal mb-3 text-center leading-relaxed">{item.name}</div>

      <div className="flex justify-center gap-4 flex-wrap mb-3">
        <span
          className={`inline-block px-3 py-2 border-2 bg-bg-primary text-[0.55rem] font-normal uppercase tracking-wider ${rarityTextColors[rarityInfo.class]} ${rarityInfo.class === "legendary" ? "animate-blink" : ""}`}
        >
          {rarityInfo.name}
        </span>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-2 text-[0.65rem] text-text-secondary">
          ⚡ Power: <span className="font-normal text-text-primary">{item.power}</span>
        </span>
      </div>

      <div className="text-[0.6rem] text-text-muted mt-2 text-center">
        {item.id.slice(0, 8)}...{item.id.slice(-6)}
      </div>
    </div>
  );
}
