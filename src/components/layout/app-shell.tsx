"use client";

import { usePathname } from "next/navigation";
import { BottomNav, SideNav, TopBar } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReels = pathname.startsWith("/reels");
  const isChat = /^\/messages\/[^/]+$/.test(pathname);
  const isComments = /^\/comments\/[^/]+$/.test(pathname);
  const isBare =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding");
  const isImmersive = isReels || isChat || isComments;

  return (
    <>
      <TopBar />
      <div className={cn("mx-auto", isBare ? "max-w-none" : "flex max-w-[1600px]")}>
        {!isBare && <SideNav />}
        <main
          className={cn(
            "flex-1 bg-canvas",
            isImmersive
              ? "min-h-[100dvh] p-0 md:min-h-[calc(100dvh-3.5rem)]"
              : isBare
                ? "min-h-[100dvh]"
                : "min-h-[calc(100dvh-3.5rem)] overflow-x-hidden pb-[calc(var(--nav-offset)+0.75rem)] md:pb-8"
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
