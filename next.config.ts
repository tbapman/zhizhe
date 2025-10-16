import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ✅ 忽略 ESLint 错误和警告
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
