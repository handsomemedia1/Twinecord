import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TwineCord — Bridging Love, Faith, and Purpose",
    template: "%s | TwineCord",
  },
  description:
    "A Christian digital platform for intentional connection, matchmaking, and marriage. Join thousands of faith-driven singles seeking meaningful, God-centered relationships.",
  keywords: [
    "Christian dating",
    "Christian matchmaking",
    "faith-based dating",
    "Christian marriage",
    "TwineCord",
    "intentional relationships",
    "Christian singles",
  ],
  authors: [{ name: "TwineCord", url: "https://twinecord.com" }],
  creator: "TwineCord",
  metadataBase: new URL("https://twinecord.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://twinecord.com",
    siteName: "TwineCord",
    title: "TwineCord — Bridging Love, Faith, and Purpose",
    description:
      "A Christian digital platform for intentional connection, matchmaking, and marriage.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TwineCord — Christian Dating Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TwineCord — Bridging Love, Faith, and Purpose",
    description:
      "A Christian digital platform for intentional connection, matchmaking, and marriage.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
