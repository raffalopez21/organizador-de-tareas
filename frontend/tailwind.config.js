/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                dark: {
                    900: '#020617', // Slate 950 base
                    800: '#0f172a', // Slate 900 cards
                    700: '#1e293b', // Borders
                },
                neon: {
                    400: '#34d399', // Emerald 400
                    500: '#10b981', // Emerald 500
                    glow: 'rgba(52, 211, 153, 0.15)'
                }
            },
            animation: {
                'float-slow': 'float 8s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
