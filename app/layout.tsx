import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ktjx-japtrip.vercel.app"), // ✅ fixes OG warning
  title: "Japan Trip Itinerary 🇯🇵",
  description:
    "1–16 March 2026 · Osaka · Kyoto · Fuji · Tokyo · Built with Next.js",
  icons: {
    icon: "/shiba.png",
  },
  openGraph: {
    title: "Japan Trip Itinerary 🇯🇵",
    description: "Follow the 16-day adventure: Osaka · Kyoto · Fuji · Tokyo",
    url: "https://ktjx-japtrip.vercel.app",
    siteName: "Japan Trip Itinerary",
    images: [
      {
        url: "/shiba.png",
        width: 512,
        height: 512,
        alt: "Shiba Inu Japan Trip Icon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Japan Trip Itinerary 🇯🇵",
    description: "Follow the 16-day adventure: Osaka · Kyoto · Fuji · Tokyo",
    images: ["/shiba.png"],
  },
};

// ✅ You must still export RootLayout as the default component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
