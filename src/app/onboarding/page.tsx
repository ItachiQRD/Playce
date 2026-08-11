"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, CompletenessBar } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { footballLevels, footballPositions } from "@/lib/demo-data";
import { calculateCompleteness, cn } from "@/lib/utils";
import type { Availability } from "@/lib/types";

export default function OnboardingPage() {
  const { auth, completeOnboarding } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    city: auth.user?.city || "Paris",
    country: auth.user?.country || "France",
    position: auth.user?.position || "st",
    level: auth.user?.level || "amateur",
    availability: (auth.user?.availability || "open") as Availability,
    bio: auth.user?.bio ?? "",
    goals: auth.user?.goals ?? "",
    current_club: auth.user?.current_club ?? "",
    languages: (auth.user?.languages ?? ["fr"]).join(", "),
    avatar_url:
      auth.user?.avatar_url ??
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(auth.user?.full_name ?? "User")}`,
  });

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const preview = calculateCompleteness({
    ...auth.user,
    ...form,
    languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
  });

  // Goal gradient: compte déjà créé = jamais partir de 0
  const stampedProgress = Math.min(100, Math.max(preview, 22 + step * 18));

  const milestones = [
    { id: "account", label: t("onboarding.stampAccount"), done: true },
    { id: "location", label: t("onboarding.location"), done: step >= 0 },
    { id: "sport", label: t("onboarding.stampSport"), done: step >= 1 },
    { id: "goals", label: t("onboarding.goals"), done: step >= 2 },
  ];

  const steps = [
    {
      title: t("onboarding.location"),
      content: (
        <div className="space-y-4">
          <Input
            label={t("onboarding.city")}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            hint={t("onboarding.defaultHint")}
          />
          <Input
            label={t("onboarding.country")}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <Input
            label={t("onboarding.photo")}
            value={form.avatar_url}
            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            hint="URL d'image (demo)"
          />
        </div>
      ),
    },
    {
      title: `${t("onboarding.position")} & ${t("onboarding.level")}`,
      content: (
        <div className="space-y-4">
          <Select
            label={t("onboarding.position")}
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            options={footballPositions.map((p) => ({
              value: p.slug,
              label: locale === "fr" ? p.name_fr : p.name_en,
            }))}
          />
          <Select
            label={t("onboarding.level")}
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            options={footballLevels.map((l) => ({
              value: l.slug,
              label: locale === "fr" ? l.name_fr : l.name_en,
            }))}
          />
          <Select
            label={t("onboarding.availability")}
            value={form.availability}
            onChange={(e) =>
              setForm({ ...form, availability: e.target.value as Availability })
            }
            options={[
              { value: "open", label: t("availability.open") },
              { value: "looking", label: t("availability.looking") },
              { value: "unavailable", label: t("availability.unavailable") },
            ]}
          />
        </div>
      ),
    },
    {
      title: t("onboarding.goals"),
      content: (
        <div className="space-y-4">
          <Textarea
            label={t("onboarding.bio")}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder={t("onboarding.bioPlaceholder")}
          />
          <Input
            label={t("onboarding.club")}
            value={form.current_club}
            onChange={(e) => setForm({ ...form, current_club: e.target.value })}
          />
          <Textarea
            label={t("onboarding.goals")}
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
          />
          <Input
            label={t("onboarding.languages")}
            value={form.languages}
            onChange={(e) => setForm({ ...form, languages: e.target.value })}
            hint="fr, en, es…"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-playce-teal text-lg font-extrabold text-white shadow-[0_8px_24px_rgba(255,79,26,0.35)]">
            P
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-playce-teal">
              {t("onboarding.step")} {step + 2} / {steps.length + 1}
            </p>
            <h1 className="font-display text-2xl font-bold">{t("onboarding.title")}</h1>
          </div>
        </div>
        <p className="text-sm text-slate-muted">{t("onboarding.subtitleMomentum")}</p>

        <div className="flex gap-2">
          {milestones.map((m, i) => (
            <div key={m.id} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                  m.done
                    ? "animate-stamp bg-playce-teal text-white"
                    : "bg-surface-2 text-slate-muted"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {m.done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <span className="line-clamp-1 text-center text-[10px] font-medium text-slate-muted">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <CompletenessBar
          value={stampedProgress}
          label={t("onboarding.progressLabel")}
        />
      </div>

      <Card className="animate-soft-in space-y-6">
        <h2 className="font-display text-lg font-semibold">{steps[step].title}</h2>
        {steps[step].content}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              {t("common.back")}
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
              {t("common.continue")}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => {
                completeOnboarding({
                  ...form,
                  languages: form.languages
                    .split(",")
                    .map((l) => l.trim())
                    .filter(Boolean),
                });
                router.push("/feed");
              }}
            >
              {t("onboarding.finish")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
