import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackToTopButton from "./components/BackToTopButton";
import { AuthProvider } from "./components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "그냥 블로그",
  description: "웹 개발, 프로그래밍, 그리고 기술에 대한 이야기를 나누는 공간입니다",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "그냥 블로그",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  colorScheme: "light dark" as const,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "transparent" },
    { media: "(prefers-color-scheme: dark)", color: "transparent" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="app-wrapper">
            {children}
            <BackToTopButton />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
