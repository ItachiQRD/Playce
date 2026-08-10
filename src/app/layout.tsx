import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PLAYCE — The Digital Infrastructure of Sport",
    template: "%s | PLAYCE",
  },
  description:
    "Where Sport Meets Opportunity. Create your Sports ID, get discovered, and connect with clubs, scouts and opportunities.",
  applicationName: "PLAYCE",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PLAYCE",
  },
  openGraph: {
    title: "PLAYCE",
    description: "Where Sport Meets Opportunity",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full bg-playce-dark font-sans text-white antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
