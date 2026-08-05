"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  Compass,
  Plus,
  Clapperboard,
  User,
  Search,
  Bell,
  MessageCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo-store";
import { Avatar } from "@/components/ui/card";
import { QuickPublishSheet } from "@/components/publish/quick-publish-sheet";

const tabs = [
  { href: "/feed", label: "Pulse", icon: Compass },
  { href: "/opportunities", label: "Ops", icon: Briefcase },
  { href: "__publish__", label: "Publish", icon: Plus },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/profile", label: "You", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [publishOpen, setPublishOpen] = useState(false);
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/" ||
    pathname.startsWith("/p/");

  if (hide) return null;

  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-3 z-50 flex justify-center px-4 md:hidden">
        <ul className="nav-capsule flex w-full max-w-md items-center justify-between rounded-[28px] bg-playce-dark/90 px-2 py-2 backdrop-blur-2xl">
          {tabs.map(({ href, label, icon: Icon }) => {
            if (href === "__publish__") {
              return (
                <li key="publish" className="-mt-8">
                  <button
                    onClick={() => setPublishOpen(true)}
                    className="publish-orb flex h-14 w-14 items-center justify-center rounded-full bg-playce-teal text-playce-black"
                    aria-label={label}
                  >
                    <Plus className="h-7 w-7" strokeWidth={2.5} />
                  </button>
                </li>
              );
            }
            const active =
              pathname === href ||
              (href !== "/feed" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex min-w-[56px] flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] transition",
                    active ? "text-playce-teal" : "text-slate-muted"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <QuickPublishSheet open={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const { auth, notifications } = useDemo();
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/" ||
    pathname.startsWith("/reels") ||
    pathname === "/feed";

  if (hide || !auth.user) return null;

  const unread = notifications.filter(
    (n) => n.user_id === auth.user!.id && !n.read
  ).length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-playce-dark/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/feed" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-playce-teal font-display text-sm font-bold text-playce-black">
            P
          </div>
          <span className="hidden font-display text-lg font-semibold tracking-wide sm:inline">
            PLAYCE
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            className="rounded-xl p-2 text-slate-muted transition hover:bg-white/5 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/messages"
            className="rounded-xl p-2 text-slate-muted transition hover:bg-white/5 hover:text-white"
            aria-label="Messages"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <Link
            href="/notifications"
            className="relative rounded-xl p-2 text-slate-muted transition hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-playce-teal px-1 text-[10px] font-bold text-playce-black">
                {unread}
              </span>
            )}
          </Link>
          {auth.user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-xl p-2 text-slate-muted transition hover:bg-white/5 hover:text-white"
              aria-label="Admin"
            >
              <Shield className="h-5 w-5" />
            </Link>
          )}
          <Link href="/profile" className="ml-1">
            <Avatar src={auth.user.avatar_url} name={auth.user.full_name} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { auth } = useDemo();
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/";

  if (hide || !auth.user) return null;

  const items = [
    { href: "/feed", label: "Pulse", icon: Compass },
    { href: "/opportunities", label: "Opportunities", icon: Briefcase },
    { href: "/publish", label: "Publish", icon: Plus },
    { href: "/reels", label: "Reels", icon: Clapperboard },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/search", label: "Search", icon: Search },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
    ...(auth.user.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r border-white/10 p-4 md:block lg:w-64">
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/feed" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-playce-teal/15 text-playce-teal"
                  : "text-slate-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 rounded-2xl border border-white/10 bg-surface p-4">
        <p className="font-display text-sm font-semibold">Where Sport Meets Opportunity</p>
        <p className="mt-1 text-xs text-slate-muted">Be seen. Be found. Raise your Signal.</p>
      </div>
    </aside>
  );
}
