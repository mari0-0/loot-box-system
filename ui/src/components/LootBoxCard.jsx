import { TREASURE_BOX } from "../config";

export default function LootBoxCard({ box, onOpen, disabled }) {
  return (
    <div
      className="bg-bg-card border-4 border-text-muted p-6 relative overflow-hidden shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.4),4px_4px_0_rgba(0,0,0,0.5)] animate-fade-in-up hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.4),6px_6px_0_rgba(0,0,0,0.5)] cursor-pointer"
      onClick={() => !disabled && onOpen(box)}
      style={{ cursor: disabled ? "default" : "pointer" }}
    >
      <img
        src={TREASURE_BOX.FRAMES[0]}
        alt="Loot Box"
        className="w-full h-auto block mx-auto mb-4 [image-rendering:pixelated] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]"
      />
      <div className="text-[0.7rem] font-normal mb-3 text-center leading-relaxed">Mystery Loot Box</div>
      <div className="inline-block px-3 py-2 border-2 border-rarity-rare bg-bg-primary text-rarity-rare text-[0.55rem] font-normal uppercase tracking-wider mb-3 w-full text-center">
        Click to Open
      </div>
      <div className="text-[0.6rem] text-text-muted mt-2 text-center">
        {box.id.slice(0, 8)}...{box.id.slice(-6)}
      </div>
    </div>
  );
}
