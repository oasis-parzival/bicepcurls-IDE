import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: '#0a0a0a',
                    darkgray: '#1a1a1a',
                    gray: '#2a2a2a',
                    green: '#00ff41',
                    greenDim: '#00cc33',
                    amber: '#ffb000',
                    red: '#ff0040',
                },
            },
            fontFamily: {
                mono: ['Fira Code', 'Courier New', 'monospace'],
            },
            animation: {
                'scanline': 'scanline 8s linear infinite',
                'flicker': 'flicker 0.15s infinite',
            },
            keyframes: {
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.95' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
