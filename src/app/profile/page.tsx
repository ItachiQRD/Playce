"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { SportsIdView } from "@/components/profile/sports-id-view";

export default function ProfilePage() {
  const { auth } = useDemo();
  const router = useRouter();

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="py-0 md:py-6">
      <SportsIdView profile={auth.user} isOwn />
    </div>
  );
}
