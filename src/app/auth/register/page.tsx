"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const { register, sports } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "athlete" as UserRole,
    sport_id: "sport-football",
  });

  const roles: UserRole[] = ["athlete", "club", "coach", "agent", "scout", "fan"];

  // IKEA effect: build identity before account credentials
  const canAdvanceIdentity = form.full_name.trim().length > 1;
  const canSubmit = form.email && form.full_name && form.password.length >= 4;

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 animate-float items-center justify-center rounded-xl bg-playce-teal text-xl font-bold text-white">
          P
        </div>
        <h1 className="font-display text-2xl font-bold">{t("auth.register")}</h1>
        <p className="mt-1 text-sm text-slate-muted">{t("auth.buildFirst")}</p>
      </div>

      <div className="mb-4 flex gap-2">
        {[t("auth.buildIdentity"), t("auth.saveAccount")].map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold",
              phase >= i
                ? "bg-playce-teal/12 text-playce-teal"
                : "bg-surface-2 text-slate-muted"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                phase > i
                  ? "bg-playce-teal text-white"
                  : phase === i
                    ? "bg-playce-teal/20 text-playce-teal"
                    : "bg-ink/10"
              )}
            >
              {phase > i ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            {label}
          </div>
        ))}
      </div>

      <Card className="animate-soft-in space-y-4">
        {phase === 0 ? (
          <>
            <Input
              id="full_name"
              label={t("auth.fullName")}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder={t("auth.namePlaceholder")}
            />
            <Select
              id="role"
              label={t("auth.role")}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              options={roles.map((r) => ({ value: r, label: t(`roles.${r}`) }))}
            />
            <Select
              id="sport"
              label={t("auth.sport")}
              value={form.sport_id}
              onChange={(e) => setForm({ ...form, sport_id: e.target.value })}
              options={sports.map((s) => ({
                value: s.id,
                label: locale === "fr" ? s.name_fr : s.name_en,
              }))}
            />
            <p className="text-xs text-slate-muted">{t("auth.ikeaHint")}</p>
            <Button
              className="w-full"
              disabled={!canAdvanceIdentity}
              onClick={() => setPhase(1)}
            >
              {t("common.continue")}
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-playce-teal/8 px-3 py-2.5 text-sm">
              <p className="font-semibold tracking-tight">{form.full_name}</p>
              <p className="text-xs text-slate-muted">
                {t(`roles.${form.role}`)} ·{" "}
                {locale === "fr"
                  ? sports.find((s) => s.id === form.sport_id)?.name_fr
                  : sports.find((s) => s.id === form.sport_id)?.name_en}
              </p>
            </div>
            <Input
              id="reg-email"
              label={t("auth.email")}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              id="reg-password"
              label={t("auth.password")}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPhase(0)}>
                {t("common.back")}
              </Button>
              <Button
                className="flex-1"
                disabled={!canSubmit}
                onClick={() => {
                  register(form);
                  router.push("/onboarding");
                }}
              >
                {t("auth.saveSportsId")}
              </Button>
            </div>
          </>
        )}
        <p className="text-center text-sm text-slate-muted">
          {t("auth.hasAccount")}{" "}
          <Link href="/auth/login" className="text-playce-teal hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
