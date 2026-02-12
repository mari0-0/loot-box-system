import React from "react";
import { CONTRACT_CONFIG } from "../config";
import { getMobileOS } from "../utils/mobile";

const DownloadAppModal = ({ onClose }) => {
    const os = getMobileOS();
    const { MOBILE_APP_LINKS } = CONTRACT_CONFIG;

    const getDownloadLink = () => {
        if (os === "iOS") return MOBILE_APP_LINKS.IOS;
        if (os === "Android") return MOBILE_APP_LINKS.ANDROID;
        return null;
    };

    const downloadLink = getDownloadLink();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-card border-4 border-text-primary p-6 max-w-sm w-full mx-4 shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors text-xl font-bold"
                >
                    ✕
                </button>

                <h2 className="text-xl md:text-2xl text-text-primary mb-4 text-center font-bold tracking-wider">
                    DOWNLOAD SLUSH WALLET
                </h2>

                <p className="text-text-secondary text-sm md:text-base text-center mb-6 leading-relaxed">
                    To connect your wallet on mobile, please download the Slush Wallet app.
                </p>

                <div className="flex flex-col gap-4">
                    {os === "iOS" || os === "unknown" ? (
                        <a
                            href={MOBILE_APP_LINKS.IOS}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#1e1e1e] border-2 border-text-muted hover:border-text-primary text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
                        >
                            <span className="text-2xl">🍎</span>
                            <span className="font-bold tracking-wide">App Store</span>
                        </a>
                    ) : null}

                    {os === "Android" || os === "unknown" ? (
                        <a
                            href={MOBILE_APP_LINKS.ANDROID}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#3ddc84] border-2 border-text-muted hover:border-text-primary text-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
                        >
                            <span className="text-2xl">🤖</span>
                            <span className="font-bold tracking-wide">Play Store</span>
                        </a>
                    ) : null}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary text-xs underline decoration-2 underline-offset-4"
                    >
                        I already have it installed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadAppModal;
