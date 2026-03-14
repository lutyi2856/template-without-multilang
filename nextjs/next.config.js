const path = require("path");
const { withFaust } = require("@faustwp/core");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Корень для output file tracing (убирает предупреждение о нескольких lockfiles)
  outputFileTracingRoot: path.join(__dirname),

  // React strict mode для выявления проблем на раннем этапе
  reactStrictMode: true,

  // Таймаут сбора page data при SSG (дефолт 60s, увеличиваем для [...slug] + GraphQL)
  staticPageGenerationTimeout: 180,

  // Ignore TypeScript and ESLint errors in production build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Оптимизация production билда (swcMinify удалён в Next.js 15 — включён по умолчанию)
  compiler: {
    // Удаление console.log в production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Оптимизация изображений
  images: {
    // Современные форматы для лучшей производительности
    formats: ["image/avif", "image/webp"],

    // Device sizes для responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Кэширование изображений
    minimumCacheTTL: 60,

    // Разрешенные источники изображений
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8002",
        pathname: "/wp-content/**",
      },
      {
        protocol: "http",
        hostname: "85.234.107.148",
        port: "8002",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unident.ru",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wp.vitmax.pro",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "wordpress-new",
        pathname: "/**",
      },
    ],

    // Опасные домены (разрешить все для development)
    ...(process.env.NODE_ENV === "development" && {
      dangerouslyAllowSVG: true,
      contentDispositionType: "attachment",
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    }),
  },

  // Experimental features для улучшения производительности
  experimental: {
    // Оптимизация импортов больших библиотек
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@iconify/react",
    ],

    // Partial Prerendering (экспериментально)
    // ppr: 'incremental',

    // Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["localhost:3000", "unident.ru"],
    },

    // Оптимизация шрифтов
    // optimizeCss: true, // Требует critters пакет: npm install critters

    // Оптимизация JavaScript бандлов
    optimizeServerReact: true,
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Strict Transport Security (HTTPS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      // Кэширование статических файлов
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Legacy: blog/services/[slug] → /services/[slug]
      {
        source: "/blog/services/:slug",
        destination: "/services/:slug",
        permanent: true,
      },
    ];
  },

  // Rewrites для API прокси (если нужно)
  async rewrites() {
    return [
      // Проксирование WordPress API
      // {
      //   source: '/wp-api/:path*',
      //   destination: 'http://localhost:8002/wp-json/:path*',
      // },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // SVG как React компоненты через @svgr/webpack
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule?.issuer,
        resourceQuery: {
          not: [...(fileLoaderRule?.resourceQuery?.not || []), /url/],
        }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Оптимизация для production
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        // Разделение кода
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Выделяем vendor библиотеки в отдельный chunk
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
            // Выделяем общий код
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Переменные окружения доступные в браузере
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru",
    NEXT_PUBLIC_WP_URL:
      process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8002",
  },

  // Production source maps (отключаем для production)
  productionBrowserSourceMaps: false,

  // Сжатие
  compress: true,

  // Генерация etag для кэширования
  generateEtags: true,

  // Page extensions
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // Powered by header (отключаем для безопасности)
  poweredByHeader: false,
};

module.exports = withFaust(nextConfig);
