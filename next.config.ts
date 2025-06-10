// バンドル分析用
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // PWA 최적화
  compress: true,
  poweredByHeader: false,
  
  // パフォーマンス最適化強化（swcMinifyを削除）
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  
  // 이미지 최적화 강화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1週間
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 高級성능 최적화（turboをturbopackに移動）
  experimental: {
    // optimizeCss: true, // Vercel配備時critters依存性問題のため一時無効化
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Turbopack설정 분리
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // コンパイル最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  
  // ESLint 배포 시 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 배포 시 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

// バンドル分析対応のエクスポート
export default withBundleAnalyzer(nextConfig);
