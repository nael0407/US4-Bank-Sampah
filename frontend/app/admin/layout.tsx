"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { AppShell } from "@/components/shared/app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
