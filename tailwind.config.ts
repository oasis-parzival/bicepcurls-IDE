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
                vsc: {
                    bg: '#1e1e1e',
                    sidebar: '#252526',
                    tabbar: '#2d2d2d',
                    activitybar: '#333333',
                    border: '#3e3e42',
                    statusbar: '#007acc',
                    accent: '#0e639c',
                    text: '#cccccc',
                    textDim: '#858585',
                    highlight: '#2a2d2e',
                    selection: '#37373d',
                    titlebar: '#3c3c3c',
                    input: '#3c3c3c',
                    green: '#4ec9b0',
                    blue: '#569cd6',
                    yellow: '#dcdcaa',
                    orange: '#ce9178',
                    red: '#f44747',
                    purple: '#c586c0',
                    hover: '#2a2d2e',
                },
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'Consolas', '"Courier New"', 'monospace'],
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
