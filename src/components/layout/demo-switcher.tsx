"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { demoProfiles } from "@/lib/demo-data";
import { FlaskConical, X } from "lucide-react";

export function DemoSwitcher() {
  const { auth, loginAs } = useDemo();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  const accounts = demoProfiles.filter((p) =>
    ["athlete", "club", "scout", "coach", "admin"].includes(p.role)
  );

  return (
    <div className="fixed bottom-24 right-3 z-[60] md:bottom-6 md:right-6">
      {open && (
        <div className="mb-2 w-64 overflow-hidden rounded-3xl border border-[var(--border)] bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
            <p className="text-xs font-semibold text-playce-teal">Mode démo</p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-muted hover:text-ink"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1">
            {accounts.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => {
                    loginAs(p.id);
                    setOpen(false);
                    router.push(p.role === "admin" ? "/admin" : "/feed");
                  }}
                  className={`flex w-full items-center gap-2 rounded-2xl px-2 py-2 text-left text-sm transition hover:bg-canvas ${
                    auth.user?.id === p.id ? "bg-playce-teal/10 text-playce-teal" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.avatar_url ?? ""}
                    alt=""
                    className="h-8 w-8 rounded-full bg-surface-2"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.full_name}</span>
                    <span className="block text-[10px] capitalize text-slate-muted">
                      {p.role}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition active:scale-95"
      >
        <FlaskConical className="h-4 w-4" />
        Demo
      </button>
    </div>
  );
}
