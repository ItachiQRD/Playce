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
import { useI18n } from "@/lib/i18n";
import { Avatar } from "@/components/ui/card";
import { QuickPublishSheet } from "@/components/publish/quick-publish-sheet";

const tabs = [
  { href: "/feed", labelKey: "nav.pulse", fallback: "Home", icon: Compass },
  { href: "/opportunities", labelKey: "nav.ops", fallback: "Ops", icon: Briefcase },
  { href: "__publish__", labelKey: "nav.publish", fallback: "Publish", icon: Plus },
  { href: "/messages", labelKey: "nav.msgs", fallback: "Msgs", icon: MessageCircle },
  { href: "/profile", labelKey: "nav.you", fallback: "You", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { auth, conversations } = useDemo();
  const [publishOpen, setPublishOpen] = useState(false);
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/" ||
    pathname.startsWith("/p/") ||
    /^\/comments\/[^/]+$/.test(pathname) ||
    /^\/messages\/[^/]+$/.test(pathname);

  if (hide) return null;

  const unreadMsgs = auth.user
    ? conversations
        .filter((c) => c.participant_ids.includes(auth.user!.id))
        .reduce((sum, c) => sum + (c.unread_count ?? 0), 0)
    : 0;

  return (
    <>
      <nav className="safe-bottom nav-bar glass-strong fixed inset-x-0 bottom-0 z-50 md:hidden">
        <ul className="mx-auto flex h-[4.25rem] max-w-lg items-end justify-between px-2 pb-1">
          {tabs.map(({ href, labelKey, fallback, icon: Icon }) => {
            const label = t(labelKey) !== labelKey ? t(labelKey) : fallback;
            if (href === "__publish__") {
              return (
                <li key="publish" className="flex flex-1 justify-center">
                  <button
                    onClick={() => setPublishOpen(true)}
                    className="publish-orb -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-playce-teal text-white"
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
            const badge = href === "/messages" ? unreadMsgs : 0;
            return (
              <li key={href} className="flex flex-1 justify-center">
                <Link
                  href={href}
                  className={cn(
                    "relative flex min-w-[56px] flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition pressable",
                    active ? "text-playce-teal" : "text-slate-muted"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", active && "nav-active-icon")}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                  <span>{label}</span>
                  {badge > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-playce-teal px-1 text-[9px] font-bold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
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
    /^\/comments\/[^/]+$/.test(pathname) ||
    /^\/messages\/[^/]+$/.test(pathname);

  if (hide || !auth.user) return null;

  const unread = notifications.filter(
    (n) => n.user_id === auth.user!.id && !n.read
  ).length;

  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-[var(--border)]">
      <div className="safe-top">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-playce-teal text-sm font-extrabold text-white">
              P
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              PLAYCE
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Link
              href="/search"
              className="rounded-xl p-2.5 text-slate-muted transition hover:bg-ink/[0.04] hover:text-ink"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/messages"
              className="hidden rounded-xl p-2.5 text-slate-muted transition hover:bg-ink/[0.04] hover:text-ink md:inline-flex"
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link
              href="/notifications"
              className="relative rounded-xl p-2.5 text-slate-muted transition hover:bg-ink/[0.04] hover:text-ink"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-playce-teal px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            {auth.user.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-xl p-2.5 text-slate-muted transition hover:bg-ink/[0.04] hover:text-ink"
                aria-label="Admin"
              >
                <Shield className="h-5 w-5" />
              </Link>
            )}
            <Link href="/profile" className="ml-1 hidden md:block">
              <Avatar src={auth.user.avatar_url} name={auth.user.full_name} size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { auth } = useDemo();
  const { t } = useI18n();
  const hide =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/";

  if (hide || !auth.user) return null;

  const items = [
    { href: "/feed", label: t("nav.home"), icon: Compass },
    { href: "/opportunities", label: t("nav.opportunities"), icon: Briefcase },
    { href: "/messages", label: t("messages.title"), icon: MessageCircle },
    { href: "/publish", label: t("nav.publish"), icon: Plus },
    { href: "/reels", label: t("nav.reels"), icon: Clapperboard },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/notifications", label: t("nav.notifications"), icon: Bell },
    { href: "/profile", label: t("nav.profile"), icon: User },
    ...(auth.user.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <aside className="glass sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r border-[var(--border)] p-4 md:block lg:w-64">
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
                  ? "bg-playce-teal/10 text-playce-teal"
                  : "text-slate-muted hover:bg-ink/[0.04] hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 glass rounded-3xl p-4">
        <p className="text-sm font-semibold tracking-tight">Where Sport Meets Opportunity</p>
        <p className="mt-1 text-xs text-slate-muted">Be seen. Be found. Raise your Signal.</p>
      </div>
    </aside>
  );
}
