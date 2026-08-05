"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const { register, sports } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "athlete" as UserRole,
    sport_id: "sport-football",
  });

  const roles: UserRole[] = ["athlete", "club", "coach", "agent", "scout", "fan"];

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-playce-teal font-display text-xl font-bold text-playce-black">
          P
        </div>
        <h1 className="font-display text-2xl font-bold">{t("auth.register")}</h1>
        <p className="mt-1 text-sm text-slate-muted">CREATE YOUR SPORTS ID.</p>
      </div>

      <Card className="space-y-4">
        <Input
          id="full_name"
          label={t("auth.fullName")}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
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
        <Button
          className="w-full"
          disabled={!form.email || !form.full_name}
          onClick={() => {
            register(form);
            router.push("/onboarding");
          }}
        >
          {t("common.continue")}
        </Button>
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
