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
    <div className="fixed bottom-20 right-3 z-[60] md:bottom-6 md:right-6">
      {open && (
        <div className="mb-2 w-64 overflow-hidden rounded-2xl border border-playce-teal/40 bg-playce-black/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <p className="text-xs font-semibold text-playce-teal">Mode démo — changer de rôle</p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-muted hover:text-white"
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
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-white/5 ${
                    auth.user?.id === p.id ? "bg-playce-teal/15 text-playce-teal" : ""
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
                    <span className="block text-[10px] text-slate-muted capitalize">
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
        className="flex items-center gap-2 rounded-full bg-playce-teal px-4 py-2.5 text-sm font-semibold text-playce-black shadow-[0_0_24px_rgba(0,184,148,0.45)] transition hover:scale-105"
      >
        <FlaskConical className="h-4 w-4" />
        Demo
      </button>
    </div>
  );
}
