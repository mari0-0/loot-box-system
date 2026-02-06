import { ConnectButton } from "@mysten/dapp-kit";
import { useState } from "react";

export default function Header({ account, balance, isVisible }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-bg-secondary/90 backdrop-blur-sm border-b-4 border-text-muted z-50 shadow-[0_4px_0_rgba(0,0,0,0.5)] animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="Logo" className="w-20 h-20 md:w-24 md:h-24" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 flex-wrap">
          {account && balance !== null && (
            <div className="px-4 py-2 bg-bg-card border-2 border-text-muted text-[0.7rem] text-text-secondary shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.4),2px_2px_0_rgba(0,0,0,0.3)]">
              Balance: <span className="text-accent-success font-normal">{balance.toFixed(4)} SUI</span>
            </div>
          )}
          <div className="pixel-button-wrapper">
            <ConnectButton />
          </div>
        </div>

        {/* Hamburger Button - Mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-bg-card border-2 border-text-muted"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-text-primary transition-all duration-200 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-text-primary my-1 transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-text-primary transition-all duration-200 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-bg-secondary border-t-2 border-text-muted animate-fade-in-up">
          <div className="px-4 py-4 flex flex-col gap-4">
            {account && balance !== null && (
              <div className="px-4 py-2 bg-bg-card border-2 border-text-muted text-[0.65rem] text-text-secondary shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.4),2px_2px_0_rgba(0,0,0,0.3)] text-center">
                Balance: <span className="text-accent-success font-normal">{balance.toFixed(4)} SUI</span>
              </div>
            )}
            <div className="pixel-button-wrapper flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
