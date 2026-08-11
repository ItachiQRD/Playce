"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, BadgeCheck, Briefcase, Sparkles } from "lucide-react";
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-playce-teal border-t-transparent" />
      </div>
    );
  }

  const enterDemo = () => {
    track("landing_cta", { action: "demo" });
    loginAs("user-athlete-1");
    router.push("/feed");
  };

  return (
    <div className="bg-canvas text-ink">
      {/* Hero */}
      <section className="relative min-h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        </div>

        <div className="relative flex min-h-[100dvh] flex-col">
          <header className="safe-top flex items-center justify-between px-5 py-5 md:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-playce-teal text-lg font-extrabold text-white">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                PLAYCE
              </span>
            </div>
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"
            >
              {locale === "fr" ? "EN" : "FR"}
            </button>
          </header>

          <div className="flex flex-1 flex-col justify-end px-5 pb-16 pt-10 md:px-10 md:pb-24">
            <div className="max-w-xl space-y-5">
              <h1
                className="animate-fade-up text-5xl font-extrabold leading-[0.95] tracking-tight text-white md:text-7xl"
                style={{ animationDelay: "0.1s" }}
              >
                PLAYCE
              </h1>
              <p
                className="animate-fade-up max-w-md text-lg text-white/80 md:text-xl"
                style={{ animationDelay: "0.25s" }}
              >
                {t("common.promise")}
              </p>
              <div
                className="animate-fade-up flex flex-wrap gap-3"
                style={{ animationDelay: "0.4s" }}
              >
                <Button size="lg" onClick={enterDemo}>
                  {t("landing.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                    variant="secondary"
                  >
                    {t("landing.secondary")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features scroll */}
      <section className="mx-auto max-w-5xl space-y-16 px-5 py-20 md:px-10">
        <div className="animate-fade-up max-w-lg" style={{ animationDelay: "0s", opacity: 1 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-playce-teal">
            {t("common.tagline")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {t("landing.line")}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Sports ID",
              body:
                locale === "fr"
                  ? "Un profil sportif clair, vérifiable, prêt à être partagé."
                  : "A clear, verifiable sports profile ready to share.",
            },
            {
              icon: Briefcase,
              title: locale === "fr" ? "Opportunités" : "Opportunities",
              body:
                locale === "fr"
                  ? "Offres et demandes matchées selon ton niveau et ton poste."
                  : "Offers and demands matched to your level and position.",
            },
            {
              icon: Sparkles,
              title: "Signal",
              body:
                locale === "fr"
                  ? "Gagne en visibilité en publiant et en restant actif."
                  : "Earn visibility by publishing and staying active.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="animate-soft-in rounded-[28px] border border-[var(--border)] bg-surface p-6"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-playce-teal/10 text-playce-teal">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-muted">{body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-4 rounded-[32px] bg-ink px-6 py-10 text-white md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {locale === "fr" ? "Prêt à être vu ?" : "Ready to be seen?"}
            </h2>
            <p className="mt-2 text-sm text-white/65">
              {t("auth.landingSubtitle")}
            </p>
          </div>
          <Button size="lg" onClick={enterDemo}>
            {t("landing.cta")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
