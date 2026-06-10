import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GlobalNetworkLoader } from "@/components/global-network-loader";
import { RouteActivitySync } from "@/components/route-activity-sync";
import "./globals.css";

const jetBrainsMono = localFont({
  src: [
    {
      path: "./fonts/JetBrainsMono-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Offres Schulte Tunisie",
  description:
    "Trouvez votre prochaine opportunite de carriere chez Schulte Tunisie",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/apple-touch-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Offres Schulte",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#F4F2EF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${jetBrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <RouteActivitySync />
        <GlobalNetworkLoader />
        {children}
      </body>
    </html>
  );
}

