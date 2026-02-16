import React, { useEffect, useState, useRef } from 'react';

const BatScrollbar = () => {
    const [scrollPercent, setScrollPercent] = useState(0);
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
        const batHeight = 40;
        const trackHeight = windowHeight - batHeight;

        // Calculate new position relative to window
        let newTop = e.clientY - (batHeight / 2);
        newTop = Math.max(0, Math.min(newTop, trackHeight));

        // Convert to percentage
        const newPercent = newTop / trackHeight;
        setScrollPercent(newPercent);

        // Scroll page
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

    // Calculate dynamic top position
    // Formula: top = percentage * (100vh - batHeight)
    const topPosition = `calc(${scrollPercent * 100}% - ${scrollPercent * 40}px)`;

    return (
        <div
            className="fixed right-0 top-0 bottom-0 w-12 pointer-events-none z-[9999]"
            style={{ height: '100vh' }}
        >
            <div
                className="absolute right-1 cursor-pointer pointer-events-auto transition-transform hover:scale-110 active:scale-95"
                style={{
                    top: topPosition,
                    width: '40px',
                    height: '40px',
                    filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))'
                }}
                onMouseDown={handleMouseDown}
                title="Dungeon Bat Scroll"
            >
                {/* Pixel Art Bat SVG - Dungeon Theme */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
                    {/* Wings Main Shape (Darker Brown) */}
                    <path d="M2 9H4V11H6V12H8V13H10V12H6V11H4V9H2Z" fill="#8b7355" />
                    <path d="M22 9H20V11H18V12H16V13H14V12H18V11H20V9H22Z" fill="#8b7355" />

                    {/* Body (Light Brown) */}
                    <path d="M10 7H14V15H10V7Z" fill="#c9b697" />
                    <path d="M11 15H13V16H11V15Z" fill="#c9b697" />

                    {/* Ears */}
                    <path d="M10 6H11V7H10V6Z" fill="#c9b697" />
                    <path d="M13 6H14V7H13V6Z" fill="#c9b697" />

                    {/* Eyes (Red) */}
                    <path d="M11 9H12V10H11V9Z" fill="#ac3232" />
                    <path d="M12 9H13V10H12V9Z" fill="#ac3232" />

                    {/* Feet */}
                    <path d="M10 16H11V17H10V16Z" fill="#c9b697" />
                    <path d="M13 16H14V17H13V16Z" fill="#c9b697" />

                    {/* Wing Details - Highlights */}
                    <path d="M2 9H4V10H2V9Z" fill="#a48b6b" />
                    <path d="M20 9H22V10H20V9Z" fill="#a48b6b" />
                </svg>
            </div>
        </div>
    );
};

export default BatScrollbar;
