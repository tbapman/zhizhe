import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/shared/NavBar";
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "智者 - 且行且思",
  description: "目标管理与成长型工具平台",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <div className="max-w-[375px] mx-auto min-h-screen bg-white shadow-lg relative">
            <main className="pb-20">
              {children}
            </main>
            <NavBar />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
