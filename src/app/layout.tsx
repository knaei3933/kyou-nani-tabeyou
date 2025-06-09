// @ts-nocheck
// Temporary fix for module resolution issues
type Metadata = {
  title?: string;
  description?: string;
  keywords?: string;
  authors?: Array<{ name: string }>;
  creator?: string;
  publisher?: string;
  formatDetection?: any;
  metadataBase?: URL;
  alternates?: any;
  openGraph?: any;
  twitter?: any;
  robots?: any;
  manifest?: string;
  appleWebApp?: any;
  other?: any;
};
import "./globals.css";
import PWAInstaller from "../components/PWAInstaller";
import OfflineIndicator from "../components/OfflineIndicator";

// Simplified font setup for now
const fontVariables = "font-sans";

export const metadata: Metadata = {
  title: '今日何食べよう | Kyou Nani Tabeyou',
  description: 'あなたの食事選択を助ける日本の一人暮らし向けPWAアプリ',
  keywords: '食事, レシピ, 一人暮らし, PWA, 日本, 料理',
  authors: [{ name: 'Kyou Nani Tabeyou Team' }],
  creator: 'Kyou Nani Tabeyou Team',
  publisher: "Kyou Nani Tabeyou",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kyou-nani-tabeyou.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "오늘 뭐먹지 - 맞춤형 레시피 추천",
    description: "냉장고 재료로 1인분 레시피를 추천받으세요",
    url: 'https://kyou-nani-tabeyou.vercel.app',
    siteName: '오늘 뭐먹지',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "오늘 뭐먹지 - 맞춤형 레시피 추천",
    description: "냉장고 재료로 1인분 레시피를 추천받으세요",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '今日何食べよう',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#667eea',
    'msapplication-TileColor': '#667eea',
    'msapplication-navbutton-color': '#667eea',
    'color-scheme': 'light',
  },
};

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="ko">
      <body
        className={`${fontVariables} antialiased`}
      >
        <OfflineIndicator />
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}
