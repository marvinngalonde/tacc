import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone', // Required for Docker/Coolify deployment
};

export default nextConfig;
