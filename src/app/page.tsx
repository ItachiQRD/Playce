"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, IdCard, Radar, Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";

export default function LandingPage() {
  const { auth, loginAs } = useDemo();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated && auth.onboardingComplete) {
      router.replace("/feed");
    } else {
      setReady(true);
    }
  }, [auth, router]);

  if (!ready && auth.isAuthenticated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-playce-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-playce-teal border-t-transparent" />
      </div>
    );
  }

  const startDemo = () => {
    track("landing_cta", { action: "demo" });
    loginAs("user-athlete-1");
    router.push("/feed");
  };

  return (
    <div className="relative min-h-[100dvh] bg-playce-black">
      {/* Hero */}
      <section className="relative min-h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-playce-black via-playce-black/70 to-playce-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(216,255,62,0.14),_transparent_50%)]" />
        </div>

        <div className="relative flex min-h-[100dvh] flex-col">
          <header className="safe-top flex items-center justify-between px-5 py-5 md:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-playce-teal text-lg font-bold text-playce-black">
                P
              </div>
              <span className="text-xl font-semibold tracking-tight">PLAYCE</span>
            </div>
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white/80 backdrop-blur"
            >
              {locale === "fr" ? "EN" : "FR"}
            </button>
          </header>

          <div className="flex flex-1 flex-col justify-end px-5 pb-14 pt-10 md:px-10 md:pb-20">
            <div className="max-w-xl space-y-5">
              <p
                className="animate-fade-up text-xs font-medium uppercase tracking-[0.22em] text-playce-teal"
                style={{ animationDelay: "0.05s" }}
              >
                {t("common.tagline")}
              </p>
              <h1
                className="animate-fade-up text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl"
                style={{ animationDelay: "0.15s" }}
              >
                PLAYCE
              </h1>
              <p
                className="animate-fade-up max-w-md text-lg text-white/70 md:text-xl"
                style={{ animationDelay: "0.28s" }}
              >
                {t("common.promise")}
              </p>
              <div
                className="animate-fade-up flex flex-wrap gap-3 pt-2"
                style={{ animationDelay: "0.4s" }}
              >
                <Button size="lg" onClick={startDemo}>
                  {t("landing.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary">
                    {t("landing.secondary")}
                  </Button>
                </Link>
              </div>
            </div>
            <p className="mt-10 animate-fade-up text-center text-xs text-white/35 md:text-left" style={{ animationDelay: "0.55s" }}>
              {locale === "fr" ? "Scroll pour découvrir" : "Scroll to explore"}
            </p>
          </div>
        </div>
      </section>

      {/* Scroll sections */}
      <section className="border-t border-white/[0.05] px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          {[
            {
              icon: IdCard,
              title: locale === "fr" ? "Sports ID" : "Sports ID",
              body:
                locale === "fr"
                  ? "Ton identité sportive unique. Visible, partageable, prête pour les clubs."
                  : "Your unique sports identity. Visible, shareable, club-ready.",
            },
            {
              icon: Radar,
              title: "Signal",
              body:
                locale === "fr"
                  ? "Sois découvert. Monte en visibilité à chaque action qui compte."
                  : "Get discovered. Raise visibility with every action that matters.",
            },
            {
              icon: Sparkles,
              title: locale === "fr" ? "Opportunités" : "Opportunities",
              body:
                locale === "fr"
                  ? "Offres et demandes matchées — transparentes, explicables."
                  : "Matched offers & demands — transparent and explainable.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="animate-rise-in space-y-3"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-playce-teal/15 text-playce-teal">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.05] px-5 py-24 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(216,255,62,0.08),_transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t("landing.line")}
          </h2>
          <p className="text-white/55">{t("auth.landingSubtitle")}</p>
          <Button size="lg" onClick={startDemo}>
            {t("landing.cta")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
