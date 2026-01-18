import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
