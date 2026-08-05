"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { footballPositions, footballLevels } from "@/lib/demo-data";

export function SportsIdCard({
  profile,
  publicUrl,
}: {
  profile: Profile;
  publicUrl: string;
}) {
  const { t, locale } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);

  const pos = footballPositions.find((p) => p.slug === profile.position);
  const lvl = footballLevels.find((l) => l.slug === profile.level);

  const downloadPng = async () => {
    const el = cardRef.current;
    if (!el) return;
    // Simple canvas export without extra deps
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#05070D";
    ctx.fillRect(0, 0, 720, 400);
    const grad = ctx.createLinearGradient(0, 0, 720, 400);
    grad.addColorStop(0, "rgba(0,184,148,0.25)");
    grad.addColorStop(1, "rgba(37,99,235,0.15)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 400);

    ctx.fillStyle = "#00B894";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("PLAYCE", 40, 50);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(profile.full_name.slice(0, 28), 40, 120);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "18px sans-serif";
    ctx.fillText(`@${profile.handle}`, 40, 155);

    const meta = [
      pos ? (locale === "fr" ? pos.name_fr : pos.name_en) : null,
      lvl ? (locale === "fr" ? lvl.name_fr : lvl.name_en) : null,
      [profile.city, profile.country].filter(Boolean).join(", ") || null,
    ]
      .filter(Boolean)
      .join("  ·  ");
    ctx.fillText(meta.slice(0, 55), 40, 200);

    ctx.fillStyle = "#00B894";
    ctx.font = "16px sans-serif";
    ctx.fillText(t("common.promise"), 40, 260);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "14px sans-serif";
    ctx.fillText(publicUrl.replace(/^https?:\/\//, "").slice(0, 50), 40, 360);

    // QR via temporary SVG not painted — draw placeholder box
    ctx.strokeStyle = "#00B894";
    ctx.strokeRect(560, 120, 120, 120);
    ctx.fillStyle = "#00B894";
    ctx.font = "12px sans-serif";
    ctx.fillText("QR", 605, 185);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `playce-${profile.handle}.png`;
    a.click();
    track("sports_id_share", { method: "download" });
  };

  const share = async () => {
    track("sports_id_share", { method: "native" });
    if (navigator.share) {
      await navigator.share({
        title: `${profile.full_name} — PLAYCE Sports ID`,
        text: t("common.promise"),
        url: publicUrl,
      });
    } else {
      await navigator.clipboard?.writeText(publicUrl);
      alert(t("common.copied"));
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-playce-teal/30 bg-gradient-to-br from-playce-black via-[#0a1628] to-playce-dark p-5"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-playce-teal/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-playce-teal">
              PLAYCE · SPORTS ID
            </p>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-full ring-2 ring-playce-teal/40"
                />
              )}
              <div>
                <h3 className="font-display text-xl font-bold">{profile.full_name}</h3>
                <p className="text-sm text-slate-muted">@{profile.handle}</p>
              </div>
            </div>
            <p className="text-sm text-white/80">
              {[
                pos ? (locale === "fr" ? pos.name_fr : pos.name_en) : null,
                lvl ? (locale === "fr" ? lvl.name_fr : lvl.name_en) : null,
                [profile.city, profile.country].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-xs text-playce-teal">{t("common.promise")}</p>
          </div>
          <div className="shrink-0 rounded-xl bg-white p-2">
            <QRCodeSVG value={publicUrl} size={96} bgColor="#ffffff" fgColor="#0F172A" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={share} className="flex-1">
          <Share2 className="h-4 w-4" />
          {t("common.share")}
        </Button>
        <Button size="sm" variant="outline" onClick={downloadPng} className="flex-1">
          <Download className="h-4 w-4" />
          {t("profile.downloadCard")}
        </Button>
      </div>
    </div>
  );
}
