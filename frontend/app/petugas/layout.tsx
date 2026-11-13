"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { AppShell } from "@/components/shared/app-shell";

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["PETUGAS", "ADMIN"]}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
