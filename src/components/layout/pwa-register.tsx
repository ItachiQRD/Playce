"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function PwaRegister() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocal) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      } else {
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      }
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || installed) return null;

  return (
    <div className="fixed bottom-24 left-3 z-[55] md:bottom-6 md:left-6">
      <Button
        size="sm"
        variant="secondary"
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
        }}
      >
        <Download className="h-4 w-4" />
        {t("common.install")}
      </Button>
    </div>
  );
}
