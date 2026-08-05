import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BottomNav, SideNav, TopBar } from "@/components/layout/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
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
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${sora.variable} h-full`}>
      <body className="min-h-full bg-playce-dark font-sans text-white antialiased">
        <Providers>
          <TopBar />
          <div className="mx-auto flex max-w-6xl">
            <SideNav />
            <main className="min-h-[calc(100dvh-3.5rem)] flex-1 pb-24 md:pb-8">
              {children}
            </main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
