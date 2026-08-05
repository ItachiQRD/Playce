"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, Avatar } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { demoProfiles } from "@/lib/demo-data";

export default function LoginPage() {
  const { loginAs } = useDemo();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-playce-teal font-display text-xl font-bold text-playce-black">
          P
        </div>
        <h1 className="font-display text-2xl font-bold">{t("auth.login")}</h1>
        <p className="mt-1 text-sm text-slate-muted">{t("common.tagline")}</p>
      </div>

      <Card className="space-y-4">
        <Input
          id="email"
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="amine@playce.demo"
        />
        <Input
          id="password"
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button
          className="w-full"
          onClick={() => {
            const found = demoProfiles.find(
              (p) => p.email.toLowerCase() === email.toLowerCase()
            );
            loginAs(found?.id ?? "user-athlete-1");
            router.push("/feed");
          }}
        >
          {t("auth.login")}
        </Button>
        <p className="text-center text-sm text-slate-muted">
          {t("auth.noAccount")}{" "}
          <Link href="/auth/register" className="text-playce-teal hover:underline">
            {t("auth.register")}
          </Link>
        </p>
      </Card>

      <div className="mt-8">
        <p className="mb-3 text-center text-xs uppercase tracking-wider text-slate-muted">
          {t("auth.switchUser")}
        </p>
        <div className="grid gap-2">
          {demoProfiles
            .filter((p) => p.role !== "fan")
            .slice(0, 6)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  loginAs(p.id);
                  router.push(p.role === "admin" ? "/admin" : "/feed");
                }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-3 py-2 text-left transition hover:border-playce-teal/40"
              >
                <Avatar src={p.avatar_url} name={p.full_name} size="sm" />
                <div>
                  <p className="text-sm font-medium">{p.full_name}</p>
                  <p className="text-xs text-slate-muted">
                    {t(`roles.${p.role}`)} · {p.email}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
