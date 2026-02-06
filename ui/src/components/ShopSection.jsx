import { CONTRACT_CONFIG, TREASURE_BOX } from "../config";

export default function ShopSection({ isPurchasing, isTxPending, account, onPurchase }) {
  return (
    <section className="text-center mb-16 py-12 px-8 bg-[url('/src/assets/dungeon_bg1.webp')] bg-center bg-cover border-4 border-text-muted shadow-[inset_0_0_50px_rgba(0,0,0,0.7),8px_8px_0_rgba(0,0,0,0.4)] relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(26,15,10,0.7)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-[1.5rem] font-normal mb-4 text-text-primary [text-shadow:3px_3px_0_var(--color-bg-primary),-1px_-1px_0_var(--color-accent-primary)] tracking-wider">
          Mystery Loot Boxes
        </h1>
        <p className="text-text-secondary text-[0.6rem] mb-8 leading-relaxed [text-shadow:2px_2px_0_var(--color-bg-primary)]">
          Purchase and open loot boxes to discover rare items with unique powers!
        </p>

        {/* Loot Box Display */}
        <div className="flex justify-center mb-8">
          <div
            className="w-64 h-64 relative cursor-pointer animate-float"
            onClick={!isPurchasing && !isTxPending && account ? onPurchase : undefined}
            style={{ cursor: account && !isPurchasing ? "pointer" : "default" }}
          >
            <img src={TREASURE_BOX.FRAMES[0]} alt="Treasure Box" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Purchase Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-bg-card border-4 border-accent-success text-[0.8rem] font-normal shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),4px_4px_0_rgba(0,0,0,0.4)]">
            <img src="/src/assets/sui-logo.png" alt="SUI" className="w-6 h-6 object-contain" />
            <span>{(CONTRACT_CONFIG.LOOT_BOX_PRICE / 1e9).toFixed(9)} SUI</span>
          </div>

          <button
            className={`px-8 py-4 text-[0.8rem] font-normal bg-accent-primary border-4 border-text-primary text-text-primary relative overflow-visible font-pixel uppercase shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.3),inset_6px_6px_0_rgba(255,255,255,0.2),6px_6px_0_rgba(0,0,0,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.3),inset_6px_6px_0_rgba(255,255,255,0.2),4px_4px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:grayscale-50 ${isPurchasing || isTxPending ? "pointer-events-none animate-blink" : ""}`}
            onClick={onPurchase}
            disabled={!account || isPurchasing || isTxPending}
          >
            {isPurchasing || isTxPending ? (
              <>
                <span className="inline-block w-4 h-4 border-[3px] border-bg-primary border-t-text-primary border-r-text-primary animate-spin-slow mr-2" />
                Processing...
              </>
            ) : !account ? (
              "Connect Wallet First"
            ) : (
              "Purchase Loot Box"
            )}
          </button>

          {!account && <p className="text-text-muted mt-2 text-[0.9rem]">Connect your Sui wallet to start playing</p>}
        </div>
      </div>
    </section>
  );
}
