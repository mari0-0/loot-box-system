import { useRef, useState } from "react";

export default function HeroSection({ onVideoEnd }) {
  const [showLogo, setShowLogo] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || showLogo) return;

    // Show logo 0.5 seconds before video ends
    if (video.duration - video.currentTime <= 1) {
      setShowLogo(true);
      if (onVideoEnd) onVideoEnd();
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // Fallback in case timeupdate didn't trigger
    if (!showLogo) {
      setShowLogo(true);
      if (onVideoEnd) onVideoEnd();
    }
  };

  return (
    <section className="relative bg-bg-primary overflow-hidden min-h-screen flex items-center justify-center">
      {/* Video - fullscreen, stays visible at last frame */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/src/assets/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Logo - revealed 0.5s before video ends, scales from center with opacity */}
      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <img src="/src/assets/logo.png" alt="Logo" className="max-w-[80%] max-h-[60vh] animate-scale-in" />
        </div>
      )}

      {/* Scroll down indicator - appears after video fully ends */}
      {videoEnded && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-fade-in-up">
          <span className="text-text-secondary text-[0.6rem] tracking-widest uppercase">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-text-secondary rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-text-primary rounded-full animate-scroll-bounce" />
          </div>
        </div>
      )}
    </section>
  );
}
