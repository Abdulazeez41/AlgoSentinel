import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://algo.blueprintstech.org";
const description =
  "Three pay-per-call Algorand analytics endpoints for AI agents: wallet risk scoring, DEX pool health, and NFT authenticity checks, settled instantly in USDC via x402.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Algo Analytics — Pay-per-call Algorand data for AI agents",
  description,
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Algo Analytics — Pay-per-call Algorand data for AI agents",
    description,
    url: siteUrl,
    siteName: "Algo Analytics",
    images: ["/opengraph-image.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Algo Analytics — Pay-per-call Algorand data for AI agents",
    description,
    images: ["/opengraph-image.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
