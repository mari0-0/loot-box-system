import React, { useEffect, useState, useRef } from 'react';

const BatScrollbar = () => {
    const [scrollPercent, setScrollPercent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const isDragging = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!isDragging.current) {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollY = window.scrollY;
                if (totalHeight > 0) {
                    setScrollPercent(scrollY / totalHeight);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        isDragging.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        const windowHeight = window.innerHeight;
        const batHeight = 32;
        const trackHeight = windowHeight - batHeight;

        let newTop = e.clientY - (batHeight / 2);
        newTop = Math.max(0, Math.min(newTop, trackHeight));

        const newPercent = newTop / trackHeight;
        setScrollPercent(newPercent);

        const totalScrollHeight = document.documentElement.scrollHeight - windowHeight;
        window.scrollTo({
            top: newPercent * totalScrollHeight,
            behavior: 'auto'
        });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    };

    const topPosition = `calc(${scrollPercent * 100}% - ${scrollPercent * 32}px)`;

    return (
        <>
            <style>
                {`
                    @keyframes bat-flap {
                        0%, 100% { transform: scaleY(1); }
                        50% { transform: scaleY(0.4) translateY(4px); }
                    }
                    @keyframes eye-glow {
                        0%, 100% { filter: brightness(1.5); }
                        50% { filter: brightness(0.8); }
                    }
                    .bat-wing-left { transform-origin: 16px 16px; }
                    .bat-wing-right { transform-origin: 16px 16px; }
                    .bat-flapping .bat-wing-left,
                    .bat-flapping .bat-wing-right {
                        animation: bat-flap 0.3s infinite ease-in-out;
                    }
                    .eye-pulsing {
                        animation: eye-glow 1s infinite alternate;
                    }
                `}
            </style>
            <div
                className="fixed right-0 top-0 bottom-0 w-8 pointer-events-none z-[9999]"
                style={{ height: '100vh' }}
            >
                {/* Bat Icon */}
                <div
                    className={`absolute right-0 cursor-grab active:cursor-grabbing pointer-events-auto transition-all duration-200 ${isDragging.current || isHovered ? 'bat-flapping' : ''}`}
                    style={{
                        top: topPosition,
                        width: '32px',
                        height: '32px',
                        filter: isHovered || isDragging.current
                            ? 'drop-shadow(0 0 6px rgba(255, 0, 0, 0.3))'
                            : 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.5))',
                        transform: isHovered || isDragging.current ? 'scale(1.15) translateX(-3px)' : 'scale(1) translateX(0)',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    title="🦇 Dungeon Bat"
                >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
                        {/* Shadow */}
                        <ellipse cx="16" cy="28" rx="6" ry="2" fill="black" opacity="0.2" />

                        {/* Wings */}
                        <g className="bat-wing-left">
                            <rect x="2" y="10" width="4" height="6" fill="#3a2f26" />
                            <rect x="6" y="12" width="4" height="6" fill="#4a3b2b" />
                            <rect x="4" y="14" width="2" height="4" fill="#584638" />
                        </g>
                        <g className="bat-wing-right">
                            <rect x="26" y="10" width="4" height="6" fill="#3a2f26" />
                            <rect x="22" y="12" width="4" height="6" fill="#4a3b2b" />
                            <rect x="26" y="14" width="2" height="4" fill="#584638" />
                        </g>

                        {/* Body */}
                        <rect x="11" y="8" width="10" height="16" fill="#3a2f26" />
                        <rect x="12" y="7" width="8" height="18" fill="#584638" />

                        {/* Ears */}
                        <rect x="12" y="4" width="2" height="3" fill="#3a2f26" />
                        <rect x="18" y="4" width="2" height="3" fill="#3a2f26" />

                        {/* Eyes */}
                        <rect x="13" y="12" width="2" height="2" fill="#ff0000" className="eye-pulsing" />
                        <rect x="17" y="12" width="2" height="2" fill="#ff0000" className="eye-pulsing" />

                        {/* Feet */}
                        <rect x="13" y="25" width="2" height="2" fill="#3a2f26" />
                        <rect x="17" y="25" width="2" height="2" fill="#3a2f26" />
                    </svg>
                </div>
            </div>
        </>
    );
};

export default BatScrollbar;
