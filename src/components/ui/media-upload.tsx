"use client";

import { useRef, useState } from "react";
import { ImagePlus, Video, X } from "lucide-react";
import { readFileAsDataUrl, cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function MediaUpload({
  value,
  onChange,
  accept = "image/*,video/*",
  label,
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  accept?: string;
  label?: string;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isVideo = value?.startsWith("data:video");

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-ink/80">{label}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setError(null);
          setLoading(true);
          try {
            const url = await readFileAsDataUrl(file);
            onChange(url);
          } catch {
            setError(t("upload.tooLarge"));
          } finally {
            setLoading(false);
            e.target.value = "";
          }
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
          {isVideo ? (
            <video src={value} className="aspect-video w-full object-cover" controls muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="aspect-video w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
            aria-label={t("common.cancel")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-canvas px-4 py-8 text-sm text-slate-muted transition hover:border-playce-teal/40 hover:text-ink",
            loading && "opacity-50"
          )}
        >
          <div className="flex gap-3">
            <ImagePlus className="h-6 w-6 text-playce-teal" />
            <Video className="h-6 w-6 text-electric-blue" />
          </div>
          <span>{loading ? t("common.loading") : t("upload.drop")}</span>
          <span className="text-[10px]">{t("upload.hint")}</span>
        </button>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
