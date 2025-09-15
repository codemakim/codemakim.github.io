import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    mdxRs: true,
  },
  // GitHub Pages용 설정 (필요시 주석 해제)
  // basePath: '/codemakim.github.io',
  // assetPrefix: '/codemakim.github.io',
};

export default withContentlayer(nextConfig);
