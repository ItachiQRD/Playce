"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  QrCode,
  Settings,
  Share2,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Avatar, Badge, Card, CompletenessBar } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  demoAchievements,
  demoMedia,
  demoStats,
  footballLevels,
  footballPositions,
} from "@/lib/demo-data";
import { SportsIdCard } from "@/components/profile/sports-id-card";
import { isMinor } from "@/lib/utils";
import type { Profile } from "@/lib/types";

function positionLabel(slug?: string | null, locale = "fr") {
  const p = footballPositions.find((x) => x.slug === slug);
  return p ? (locale === "fr" ? p.name_fr : p.name_en) : slug ?? "—";
}

function levelLabel(slug?: string | null, locale = "fr") {
  const l = footballLevels.find((x) => x.slug === slug);
  return l ? (locale === "fr" ? l.name_fr : l.name_en) : slug ?? "—";
}

export function SportsIdView({
  profile,
  isOwn = false,
}: {
  profile: Profile;
  isOwn?: boolean;
}) {
  const { t, locale } = useI18n();
  const { experiences, startConversation, auth, requestVerification } = useDemo();
  const router = useRouter();
  const [showCard, setShowCard] = useState(false);
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${profile.handle}`
      : `/p/${profile.handle}`;

  const stats = demoStats.filter((s) => s.profile_id === profile.id);
  const media = demoMedia.filter((m) => m.profile_id === profile.id);
  const achievements = demoAchievements.filter((a) => a.profile_id === profile.id);
  const exps = experiences.filter((e) => e.profile_id === profile.id);
  const minor = isMinor(profile.birth_date);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative h-40 overflow-hidden bg-playce-black sm:h-52 sm:rounded-b-3xl">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_url}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-playce-teal/30 to-electric-blue/20" />
        )}
      </div>

      <div className="relative px-4 pb-8">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name}
              size="xl"
              className="ring-4 ring-playce-dark"
            />
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{profile.full_name}</h1>
                {profile.identity_verified && (
                  <BadgeCheck className="h-5 w-5 text-playce-teal" />
                )}
              </div>
              <p className="text-sm text-slate-muted">
                @{profile.handle} · {t(`roles.${profile.role}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwn ? (
              <>
                <Link href="/profile/edit" className="flex-1 sm:flex-none">
                  <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                    {t("profile.edit")}
                  </Button>
                </Link>
                <Link href="/profile/settings">
                  <Button size="sm" variant="ghost" aria-label={t("profile.settings") ?? "Settings"}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    if (!auth.user) return;
                    if (isMinor(profile.birth_date) && !auth.user.identity_verified) {
                      alert(t("messages.minorBlocked"));
                      return;
                    }
                    const id = startConversation(profile.id);
                    router.push(`/messages/${id}`);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("common.message")}
                </Button>
                <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
                  {t("common.follow")}
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              aria-label="QR"
              onClick={() => setShowCard((s) => !s)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Share"
              onClick={() => {
                navigator.clipboard?.writeText(publicUrl);
                alert(t("common.copied"));
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showCard && (
          <div className="mt-4">
            <SportsIdCard profile={profile} publicUrl={publicUrl} />
          </div>
        )}

        {minor && (
          <Card className="mt-4 border-warning/30 bg-warning/5 text-sm text-warning">
            {t("profile.minorNotice")}
          </Card>
        )}

        {isOwn && !profile.identity_verified && (
          <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 border-electric-blue/30 bg-electric-blue/5">
            <p className="text-sm">{t("profile.needVerified")}</p>
            <Button size="sm" variant="outline" onClick={requestVerification}>
              {t("profile.requestVerification")}
            </Button>
          </Card>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="teal">{t(`availability.${profile.availability}`)}</Badge>
          {profile.position && (
            <Badge variant="blue">{positionLabel(profile.position, locale)}</Badge>
          )}
          {profile.level && <Badge>{levelLabel(profile.level, locale)}</Badge>}
          {profile.sport && (
            <Badge>
              {profile.sport.icon}{" "}
              {locale === "fr" ? profile.sport.name_fr : profile.sport.name_en}
            </Badge>
          )}
          {profile.email_verified && <Badge variant="success">Email ✓</Badge>}
        </div>

        {(profile.city || profile.country) && (
          <p className="mt-3 flex items-center gap-1 text-sm text-slate-muted">
            <MapPin className="h-4 w-4" />
            {[profile.city, profile.country].filter(Boolean).join(", ")}
          </p>
        )}

        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-white/90">{profile.bio}</p>
        )}

        {profile.goals && (
          <Card className="mt-4 border-playce-teal/20 bg-playce-teal/5">
            <p className="text-xs uppercase tracking-wider text-playce-teal">{t("common.goals")}</p>
            <p className="mt-1 text-sm">{profile.goals}</p>
          </Card>
        )}

        {isOwn && (
          <div className="mt-4">
            <CompletenessBar value={profile.completeness} />
          </div>
        )}

        {stats.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">{t("profile.stats")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <Card key={s.id} className="text-center">
                  <p className="font-display text-2xl font-bold tabular-nums text-playce-teal">
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-muted">{s.label}</p>
                  {s.is_declarative && (
                    <Badge variant="warning" className="mt-2">
                      {t("profile.declarative")}
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {exps.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">
              {t("profile.experience")}
            </h2>
            <div className="space-y-3">
              {exps.map((e) => (
                <Card key={e.id}>
                  <p className="font-medium">{e.organization}</p>
                  <p className="text-sm text-slate-muted">
                    {e.role}
                    {e.level ? ` · ${levelLabel(e.level, locale)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-muted">
                    {e.start_date?.slice(0, 4)} —{" "}
                    {e.is_current ? t("common.present") : e.end_date?.slice(0, 4)}
                  </p>
                  {e.description && (
                    <p className="mt-2 text-sm text-white/80">{e.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {media.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">{t("profile.media")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {media.map((m) => (
                <Card key={m.id} className="overflow-hidden p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.thumbnail_url || m.url}
                    alt={m.title ?? ""}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium">{m.title}</p>
                    {m.is_highlight && <Badge variant="teal">Highlight</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {achievements.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">
              {t("profile.achievements")}
            </h2>
            <div className="space-y-2">
              {achievements.map((a) => (
                <Card key={a.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-slate-muted">
                      {[a.issuer, a.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge>{a.type}</Badge>
                </Card>
              ))}
            </div>
          </section>
        )}

        {profile.languages?.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">{t("common.languages")}</h2>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((l) => (
                <Badge key={l}>{l.toUpperCase()}</Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
