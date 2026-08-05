"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Home,
  PlusSquare,
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

const tabs = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/publish", label: "Publish", icon: PlusSquare },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/" ||
    pathname.startsWith("/p/");

  if (hide) return null;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-playce-black/95 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/feed" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex min-w-[64px] flex-col items-center gap-0.5 px-2 py-2 text-[10px] transition",
                  active ? "text-playce-teal" : "text-slate-muted hover:text-white"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(0,184,148,0.6)]")}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const { auth, notifications } = useDemo();
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/" ||
    pathname.startsWith("/reels");

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
    ...tabs,
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
        <p className="mt-1 text-xs text-slate-muted">Talent is everywhere. Opportunity isn&apos;t.</p>
      </div>
    </aside>
  );
}
