import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    statusBarStyle: "default",
    title: "PLAYCE",
  },
  openGraph: {
    title: "PLAYCE",
    description: "Where Sport Meets Opportunity",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F3F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full`} style={{ colorScheme: "auto" }}>
      <body className="min-h-full bg-canvas font-sans text-ink antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
