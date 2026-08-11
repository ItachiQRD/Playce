"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--border)] bg-surface p-4 shadow-[0_1px_2px_rgba(12,14,18,0.04)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "teal" | "blue" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-surface-2 text-ink/70",
    teal: "bg-playce-teal/12 text-playce-teal",
    blue: "bg-electric-blue/10 text-electric-blue",
    success: "bg-success/12 text-success",
    warning: "bg-warning/12 text-warning",
    danger: "bg-danger/12 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-24 w-24 text-2xl",
  };
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-[var(--border)]",
        sizes[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-playce-teal">
          {initials}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--border)] bg-surface/60 px-6 py-14 text-center">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-slate-muted">{description}</p>
      )}
      {action}
    </div>
  );
}

export function CompletenessBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const { t } = useI18n();
  const color =
    value >= 80 ? "bg-success" : value >= 60 ? "bg-playce-teal" : "bg-warning";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-muted">
        <span>{label ?? t("profile.completenessLabel")}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
