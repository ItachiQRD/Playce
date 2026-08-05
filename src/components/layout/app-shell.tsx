"use client";

import { usePathname } from "next/navigation";
import { BottomNav, SideNav, TopBar } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPulseMobile = pathname === "/feed";
  const isReels = pathname.startsWith("/reels");
  const isBare =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding");

  return (
    <>
      <TopBar />
      <div
        className={cn(
          "mx-auto",
          isBare ? "max-w-none" : "flex max-w-6xl"
        )}
      >
        {!isBare && <SideNav />}
        <main
          className={cn(
            "flex-1 bg-playce-dark",
            isPulseMobile || isReels
              ? "min-h-[100dvh] p-0 md:min-h-[calc(100dvh-3.5rem)]"
              : isBare
                ? "min-h-[100dvh]"
                : "min-h-[calc(100dvh-3.5rem)] pb-28 md:pb-8"
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
