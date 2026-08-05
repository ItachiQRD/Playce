"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { footballLevels, footballPositions } from "@/lib/demo-data";
import type { Availability } from "@/lib/types";

export default function EditProfilePage() {
  const { auth, updateProfile } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: auth.user?.full_name ?? "",
    bio: auth.user?.bio ?? "",
    city: auth.user?.city ?? "",
    country: auth.user?.country ?? "",
    position: auth.user?.position ?? "",
    level: auth.user?.level ?? "",
    availability: (auth.user?.availability ?? "open") as Availability,
    goals: auth.user?.goals ?? "",
    current_club: auth.user?.current_club ?? "",
    avatar_url: auth.user?.avatar_url ?? "",
    cover_url: auth.user?.cover_url ?? "",
    languages: (auth.user?.languages ?? []).join(", "),
  });

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 font-display text-2xl font-bold">{t("profile.edit")}</h1>
      <Card className="space-y-4">
        <Input
          label={t("auth.fullName")}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          label="Avatar URL"
          value={form.avatar_url}
          onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
        />
        <Input
          label="Cover URL"
          value={form.cover_url}
          onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
        />
        <Textarea
          label="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ville"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            label="Pays"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>
        <Select
          label={t("onboarding.position")}
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          options={[
            { value: "", label: "—" },
            ...footballPositions.map((p) => ({
              value: p.slug,
              label: locale === "fr" ? p.name_fr : p.name_en,
            })),
          ]}
        />
        <Select
          label={t("onboarding.level")}
          value={form.level}
          onChange={(e) => setForm({ ...form, level: e.target.value })}
          options={[
            { value: "", label: "—" },
            ...footballLevels.map((l) => ({
              value: l.slug,
              label: locale === "fr" ? l.name_fr : l.name_en,
            })),
          ]}
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
        />
        <Button
          className="w-full"
          onClick={() => {
            updateProfile({
              ...form,
              languages: form.languages
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean),
            });
            router.push("/profile");
          }}
        >
          {t("common.save")}
        </Button>
      </Card>
    </div>
  );
}
