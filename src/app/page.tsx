"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
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

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-playce-black">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
          alt=""
          className="h-full w-full object-cover scale-105 animate-[pulse_12s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-playce-black via-playce-black/75 to-playce-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,184,148,0.18),_transparent_55%)]" />
      </div>

      <div className="relative flex min-h-[100dvh] flex-col">
        <header className="flex items-center justify-between px-5 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-playce-teal font-display text-xl font-bold text-playce-black shadow-[0_0_30px_rgba(0,184,148,0.45)]">
              P
            </div>
            <span className="font-display text-2xl font-semibold tracking-[0.08em]">
              PLAYCE
            </span>
          </div>
          <button
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:text-white"
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-end px-5 pb-16 pt-10 md:px-10 md:pb-24">
          <div className="max-w-2xl space-y-6">
            <p
              className="animate-fade-up font-display text-xs font-medium uppercase tracking-[0.25em] text-playce-teal"
              style={{ animationDelay: "0.1s" }}
            >
              {t("common.tagline")}
            </p>
            <h1
              className="animate-fade-up font-display text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl"
              style={{ animationDelay: "0.25s" }}
            >
              PLAYCE
            </h1>
            <p
              className="animate-fade-up max-w-md text-lg text-white/75 md:text-xl"
              style={{ animationDelay: "0.4s" }}
            >
              {t("common.promise")}
            </p>
            <p
              className="animate-fade-up max-w-lg text-sm text-slate-muted"
              style={{ animationDelay: "0.5s" }}
            >
              {t("auth.landingSubtitle")}
            </p>
            <div
              className="animate-fade-up flex flex-wrap gap-3"
              style={{ animationDelay: "0.65s" }}
            >
              <Button
                size="lg"
                onClick={() => {
                  track("landing_cta", { action: "demo" });
                  loginAs("user-athlete-1");
                  router.push("/feed");
                }}
              >
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

          <p
            className="animate-fade-up mt-16 text-xs tracking-wide text-white/40"
            style={{ animationDelay: "0.9s" }}
          >
            {t("landing.line")}
          </p>
        </div>
      </div>
    </div>
  );
}
