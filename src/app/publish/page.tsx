"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MediaUpload } from "@/components/ui/media-upload";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { PostType } from "@/lib/types";
import Link from "next/link";

export default function PublishPage() {
  const { auth, createPost, requestVerification } = useDemo();
  const { t } = useI18n();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("text");
  const [mediaUrl, setMediaUrl] = useState<string | undefined>();
  const [hashtags, setHashtags] = useState("");

  if (!auth.user) {
    router.replace("/auth/login");
    return null;
  }

  const canPublish = auth.user.completeness >= 40;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 font-display text-2xl font-bold">{t("common.publish")}</h1>

      {!canPublish && (
        <Card className="mb-4 border-warning/30 bg-warning/5 text-sm">
          {t("publish.needProfile")} ({auth.user.completeness}%)
          <div className="mt-2">
            <Link href="/profile/edit">
              <Button size="sm" variant="outline">
                {t("feed.completeProfile")}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {!auth.user.identity_verified && auth.user.role === "club" && (
        <Card className="mb-4 border-electric-blue/30 bg-electric-blue/5 text-sm">
          <p>{t("profile.needVerified")}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={requestVerification}>
            {t("profile.requestVerification")}
          </Button>
        </Card>
      )}

      <Card className="space-y-4">
        <Select
          label={t("publish.type")}
          value={type}
          onChange={(e) => setType(e.target.value as PostType)}
          options={[
            { value: "text", label: "Text" },
            { value: "image", label: "Image" },
            { value: "highlight", label: "Highlight" },
            { value: "training", label: "Training" },
            { value: "announcement", label: "Announcement" },
            { value: "opportunity_search", label: "Opportunity search" },
            { value: "reel", label: "Reel" },
            { value: "result", label: "Result" },
          ]}
        />
        <Textarea
          label={t("publish.content")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("publish.contentPlaceholder")}
        />
        {(type === "image" ||
          type === "highlight" ||
          type === "reel" ||
          type === "video" ||
          type === "training") && (
          <MediaUpload
            label={t("publish.media")}
            value={mediaUrl}
            onChange={setMediaUrl}
          />
        )}
        <Input
          label={t("publish.hashtags")}
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="football, goals, training"
        />
        <Button
          className="w-full"
          disabled={!content.trim() || !canPublish}
          onClick={() => {
            createPost({
              content: content.trim(),
              type,
              media_url: mediaUrl,
              thumbnail_url: mediaUrl?.startsWith("data:image") ? mediaUrl : undefined,
              hashtags: hashtags
                .split(",")
                .map((h) => h.trim().replace(/^#/, ""))
                .filter(Boolean),
            });
            router.push(type === "reel" ? "/reels" : "/feed");
          }}
        >
          {t("common.publish")}
        </Button>
      </Card>
    </div>
  );
}
