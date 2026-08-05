"use client";

import { DemoProvider } from "@/lib/demo-store";
import { I18nProvider } from "@/lib/i18n";
import { DemoSwitcher } from "@/components/layout/demo-switcher";
import { PwaRegister } from "@/components/layout/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <DemoProvider>
        {children}
        <DemoSwitcher />
        <PwaRegister />
      </DemoProvider>
    </I18nProvider>
  );
}
