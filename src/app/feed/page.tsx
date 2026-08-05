"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { ImmersiveDiscover } from "@/components/feed/immersive-discover";

export default function FeedPage() {
  const { auth } = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) router.replace("/auth/login");
    else if (!auth.onboardingComplete) router.replace("/onboarding");
  }, [auth, router]);

  if (!auth.user) return null;

  return (
    <div className="-mx-0 md:px-0">
      {/* Mobile: full-bleed immersive. Desktop: framed. */}
      <div className="md:mx-auto md:max-w-lg md:overflow-hidden md:rounded-3xl md:border md:border-white/10 md:shadow-2xl">
        <ImmersiveDiscover />
      </div>
    </div>
  );
}
