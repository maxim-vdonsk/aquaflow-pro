"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  assignAdminByEmail,
  setUserRole,
  type ActionResult,
} from "@/app/actions/admin";
import { Plus, ShieldOff, ShieldCheck } from "lucide-react";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Users tab of the operator panel: role table + "add admin by email".
 * Actions run server-side and are role-guarded; the last-admin rule lives
 * in app/actions/admin.ts, this UI only surfaces its message.
 */
export function AdminUsers({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [message, setMessage] = React.useState<ActionResult | null>(null);
  const [busy, setBusy] = React.useState(false);

  const run = (makeForm: () => Promise<ActionResult>) => {
    setBusy(true);
    setMessage(null);
    makeForm()
      .then((res) => {
        setMessage(res);
        if (res.ok) router.refresh();
      })
      .finally(() => setBusy(false));
  };

  const onRoleClick = (userId: string, role: string) =>
    run(() => {
      const fd = new FormData();
      fd.set("userId", userId);
      fd.set("role", role);
      return setUserRole(fd);
    });

  const onAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector<HTMLInputElement>('input[name="email"]')?.value ?? "";
    run(async () => {
      const fd = new FormData();
      fd.set("email", email);
      const res = await assignAdminByEmail(fd);
      if (res.ok) form.reset();
      return res;
    });
  };

  const lastAdminOnly = users.filter((u) => u.role === "admin").length <= 1;

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.ok
              ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-400"
              : "border-red-600/40 bg-red-600/10 text-red-400"
          }`}
        >
          {message.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b text-[var(--color-muted-foreground)]">
              <th className="px-6 py-3 font-medium">Пользователь</th>
              <th className="px-6 py-3 font-medium">Роль</th>
              <th className="px-6 py-3 text-right font-medium">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4">
                  {u.name}
                  <div className="text-xs text-[var(--color-muted-foreground)]">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      u.role === "admin"
                        ? "font-medium text-[var(--color-primary)]"
                        : "text-[var(--color-muted-foreground)]"
                    }
                  >
                    {u.role === "admin" ? "админ" : "клиент"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role === "admin" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy || lastAdminOnly}
                      title={lastAdminOnly ? "Последнего админа снять нельзя" : undefined}
                      onClick={() => onRoleClick(u.id, "customer")}
                    >
                      <ShieldOff className="h-4 w-4" />
                      Снять админа
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => onRoleClick(u.id, "admin")}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Сделать админом
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={onAssign}
        className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row"
      >
        <Input
          name="email"
          type="email"
          placeholder="email зарегистрированного клиента"
          required
          className="sm:max-w-sm"
        />
        <Button type="submit" disabled={busy} className="shrink-0">
          <Plus className="h-4 w-4" />
          Добавить админа
        </Button>
      </form>
      {lastAdminOnly && (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Последнего администратора снять нельзя — protection от само-блокировки панели.
        </p>
      )}
    </div>
  );
}