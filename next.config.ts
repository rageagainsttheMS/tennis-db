import type { NextConfig } from "next";

// No `output: 'standalone'`: cdk-nextjs 0.7+ deploys through the Next.js
// Deployment Adapter API, and the two can't be combined.
const nextConfig: NextConfig = {};

export default nextConfig;
