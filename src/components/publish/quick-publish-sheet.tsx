"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Clapperboard, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/ui/media-upload";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuickPublishSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { createPost, auth, signal } = useDemo();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "media" | "reel">("media");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setContent("");
      setMedia(undefined);
      setMode("media");
    }
  }, [open]);

  if (!open) return null;

  const publish = () => {
    if (!content.trim() && !media) return;
    const type: PostType =
      mode === "reel" ? "reel" : media ? "highlight" : "text";
    createPost({
      content: content.trim() || (locale === "fr" ? "Nouveau signal" : "New signal"),
      type,
      media_url: media,
      thumbnail_url: media?.startsWith("data:image") ? media : undefined,
      hashtags: ["playce"],
    });
    onClose();
    if (type === "reel") router.push("/reels");
  };

  return (
    <div className="fixed inset-0 z-[70] md:hidden">
      <button
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="safe-bottom absolute inset-x-0 bottom-0 animate-slide-card rounded-t-[28px] border border-[var(--border)] bg-surface px-4 pb-8 pt-3 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight">
              {locale === "fr" ? "Partage ton Signal" : "Share your Signal"}
            </p>
            <p className="text-xs font-medium text-playce-teal">
              +{mode === "reel" ? 35 : 25} Signal · streak {signal.streak}d
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-canvas p-2 text-slate-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {(
            [
              { id: "media", icon: Sparkles, label: "Highlight" },
              { id: "reel", icon: Clapperboard, label: "Reel" },
              { id: "text", icon: Type, label: "Texte" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-semibold transition",
                mode === m.id
                  ? "bg-playce-teal text-white"
                  : "bg-canvas text-slate-muted"
              )}
            >
              <m.icon className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        {(mode === "media" || mode === "reel") && (
          <div className="mb-3">
            <MediaUpload value={media} onChange={setMedia} />
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            locale === "fr"
              ? "Une phrase. Un moment. Sois vu."
              : "One line. One moment. Be seen."
          }
          className="mb-4 min-h-[88px] w-full resize-none rounded-2xl border border-[var(--border)] bg-canvas px-4 py-3 text-sm outline-none focus:border-playce-teal/40"
        />

        {auth.user && auth.user.completeness < 40 ? (
          <div className="space-y-3">
            <p className="text-center text-xs text-warning">
              {t("publish.needProfile")} ({auth.user.completeness}%)
            </p>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => {
                onClose();
                router.push("/profile/edit");
              }}
            >
              {t("feed.completeProfile")}
            </Button>
          </div>
        ) : (
          <Button className="w-full" size="lg" onClick={publish}>
            {locale === "fr" ? "Publier & gagner du Signal" : "Publish & earn Signal"}
          </Button>
        )}
      </div>
    </div>
  );
}
