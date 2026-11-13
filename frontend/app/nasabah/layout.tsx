"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { AppShell } from "@/components/shared/app-shell";

export default function NasabahLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["NASABAH"]}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
