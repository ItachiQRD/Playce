"use client";

import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { SportsIdView } from "@/components/profile/sports-id-view";
import { EmptyState } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicProfilePage() {
  const params = useParams<{ handle: string }>();
  const { profiles, auth } = useDemo();
  const profile = profiles.find((p) => p.handle === params.handle);

  if (!profile || profile.is_suspended) {
    return (
      <div className="px-4 py-12">
        <EmptyState
          title="Profil introuvable"
          description="Ce Sports ID n'existe pas ou n'est plus disponible."
          action={
            <Link href="/feed">
              <Button>Retour</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (profile.visibility === "private" && auth.user?.id !== profile.id) {
    return (
      <div className="px-4 py-12">
        <EmptyState title="Profil privé" description="Ce profil n'est pas public." />
      </div>
    );
  }

  return (
    <div className="py-0 md:py-6">
      <SportsIdView profile={profile} isOwn={auth.user?.id === profile.id} />
    </div>
  );
}
