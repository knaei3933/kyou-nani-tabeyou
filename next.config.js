/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode 설정 (루트 레벨에 위치)
  reactStrictMode: true,

  // 이미지 최적화 설정
  images: {
    // 허용된 이미지 도메인 (외부 이미지 소스)
    domains: [
      'images.unsplash.com',
      'assets.example.com',
      'cdn.fooddelivery.com',
      'restaurant-images.com'
    ],
    // 이미지 형식 설정 (WebP 자동 변환)
    formats: ['image/webp', 'image/avif'],
    // 디바이스별 이미지 크기 설정
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1920],
    // 이미지 크기 브레이크포인트
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 원격 이미지 패턴 허용
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
        pathname: '/**',
      }
    ],
    // 위험한 URL 허용 (개발 중에만 사용)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 성능 최적화 설정
  experimental: {
    // 메모리 사용량 최적화
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack 설정 커스터마이징
  webpack: (config, { dev, isServer }) => {
    // 이미지 압축 플러그인 추가
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          images: {
            test: /\.(png|jpg|jpeg|gif|svg|webp|avif)$/,
            name: 'images',
            chunks: 'all',
            priority: 10,
          }
        }
      }
    }

    // SVG 컴포넌트로 임포트 지원
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  },

  // 헤더 설정 (캐싱 최적화)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // 이미지 파일 캐싱 설정
        source: '/(.*)\\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 폰트 파일 캐싱
        source: '/(.*)\\.(woff|woff2|eot|ttf|otf)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 압축 설정
  compress: true,

  // 페이지 확장자 설정
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // 트레일링 슬래시 설정
  trailingSlash: false,

  // 빌드 ID 생성
  generateBuildId: async () => {
    return `build_${Date.now()}`
  },
};

module.exports = nextConfig; 