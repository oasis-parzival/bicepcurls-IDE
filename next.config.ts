import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const deployTarget = process.env.DEPLOY_TARGET; // 'netlify' or 'github'

const nextConfig: NextConfig = {
    output: 'export',
    // Netlify deploys to root, while GitHub Pages uses repo subpath
    basePath: (isProd && deployTarget !== 'netlify') ? '/bicepcurls-IDE' : '',
    assetPrefix: (isProd && deployTarget !== 'netlify') ? '/bicepcurls-IDE/' : '',
    images: {
        unoptimized: true,
    },
    webpack: (config) => {
        // Monaco Editor requires this
        config.module.rules.push({
            test: /\.ttf$/,
            type: 'asset/resource',
        });
        return config;
    },
};

export default nextConfig;
