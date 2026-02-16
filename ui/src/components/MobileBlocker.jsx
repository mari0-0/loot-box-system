import React, { useEffect } from "react";

const MobileBlocker = () => {
    useEffect(() => {
        console.log("Rendering MobileBlocker");
        // Force body background to match theme
        document.body.style.backgroundColor = '#1a0f0a';
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a0f0a', // --color-bg-primary
            color: '#f4e4c1', // --color-text-primary
            padding: '20px',
            textAlign: 'center',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '12px',
            lineHeight: '1.6',
            imageRendering: 'pixelated'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '90%',
                border: '4px solid #8b7355', // --color-text-muted
                backgroundColor: '#3d2418', // --color-bg-card
                padding: '2rem',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
                borderRadius: '0' // Keep it pixel-perfect
            }}>
                {/* Icon */}
                <div style={{
                    fontSize: '48px',
                    marginBottom: '24px',
                    filter: 'grayscale(0.3)'
                }}>
                    📱
                </div>

                {/* Title */}
                <h1 style={{
                    color: '#ac3232', // --color-accent-danger
                    fontSize: '20px',
                    fontWeight: 'normal',
                    marginBottom: '16px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    OOPS!
                </h1>

                {/* Subtitle */}
                <h2 style={{
                    color: '#c9b697', // --color-text-secondary
                    fontSize: '14px',
                    fontWeight: 'normal',
                    marginBottom: '24px',
                    lineHeight: '1.4'
                }}>
                    Mobile Access Restricted
                </h2>

                {/* Message */}
                <p style={{
                    color: '#f4e4c1', // --color-text-primary
                    fontSize: '11px',
                    lineHeight: '1.8',
                    marginBottom: '0'
                }}>
                    Please open this on a{' '}
                    <span style={{
                        color: '#d95763', // --color-accent-primary
                        fontWeight: 'normal'
                    }}>
                        desktop device
                    </span>
                    {' '}for the best experience.
                </p>

                {/* Footer */}
                <div style={{
                    marginTop: '32px',
                    paddingTop: '16px',
                    borderTop: '2px solid #8b7355', // --color-text-muted
                    color: '#8b7355',
                    fontSize: '8px'
                }}>
                    Loot Box Arena © 2026
                </div>
            </div>
        </div>
    );
};

export default MobileBlocker;
