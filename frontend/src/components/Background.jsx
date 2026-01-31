import React from 'react';

export const Background = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#000]">
            {/* Base Gradient from reference: #001d11 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#001d11] to-[#013110]" />

            {/* Atmospheric glow effects - dark greens */}
            <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#00322e]/30 rounded-full blur-[120px] animate-float-slow mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#014d3a]/20 rounded-full blur-[100px] animate-float-slow mix-blend-screen" style={{ animationDelay: '2s' }} />

            {/* Grain overlay for texture */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Diagonal scanlines/grid inspired by the gradient style */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>
    );
};
