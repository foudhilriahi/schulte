import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { BottomNav } from "@/components/bottom-nav";
import { ToastProvider } from "@/components/toast-provider";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schulte Tunisia Jobs",
  description:
    "Find your next career opportunity at Schulte Tunisia automotive factory",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Schulte Jobs",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <div className="max-w-lg mx-auto bg-background min-h-screen relative">
            {children}
            <BottomNav />
          </div>
          <ToastProvider />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
