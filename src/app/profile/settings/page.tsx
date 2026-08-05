"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { Visibility } from "@/lib/types";

export default function SettingsPage() {
  const { auth, updateProfile, logout } = useDemo();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(auth.user, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playce-export-${auth.user!.handle}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("profile.settings")}</h1>

      <Card className="space-y-4">
        <h2 className="font-display font-semibold">{t("profile.privacy")}</h2>
        <Select
          label="Visibilité du profil"
          value={auth.user.visibility}
          onChange={(e) =>
            updateProfile({ visibility: e.target.value as Visibility })
          }
          options={[
            { value: "public", label: "Public" },
            { value: "limited", label: "Limité" },
            { value: "private", label: "Privé" },
          ]}
        />
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Masquer l&apos;âge</span>
          <input
            type="checkbox"
            checked={!!auth.user.hide_age}
            onChange={(e) => updateProfile({ hide_age: e.target.checked })}
            className="h-4 w-4 accent-playce-teal"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Autoriser le contact direct</span>
          <input
            type="checkbox"
            checked={auth.user.allow_direct_contact}
            onChange={(e) =>
              updateProfile({ allow_direct_contact: e.target.checked })
            }
            className="h-4 w-4 accent-playce-teal"
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display font-semibold">Langue</h2>
        <Select
          label="Interface"
          value={locale}
          onChange={(e) => setLocale(e.target.value as "fr" | "en")}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
          ]}
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display font-semibold">RGPD</h2>
        <Button variant="secondary" className="w-full" onClick={exportData}>
          {t("profile.exportData")}
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            if (confirm("Supprimer le compte local (démo) ?")) {
              logout();
              router.push("/");
            }
          }}
        >
          {t("profile.deleteAccount")}
        </Button>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Déconnexion
      </Button>
    </div>
  );
}
