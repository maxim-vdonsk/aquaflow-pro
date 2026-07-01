"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { TelegramLoginButton } from "@/components/telegram-login";
import { setPhone } from "@/app/actions/profile";

interface LoginFormProps {
  telegramBotUsername?: string;
  showTelegramLogin?: boolean;
}

export function LoginForm({
  telegramBotUsername,
  showTelegramLogin,
}: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "Ошибка входа");
      } else {
        const res = await authClient.signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message || "Ошибка регистрации");
        if (phone.trim()) await setPhone(phone.trim());
      }
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{mode === "signin" ? "Вход" : "Регистрация"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Имя</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === "signup"}
                />
              </div>
            )}
            {mode === "signup" && (
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Телефон</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 999 123-45-67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={mode === "signup"}
                    className="pl-9"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Пароль</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="rounded-[var(--radius-sm)] bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>

          {showTelegramLogin && telegramBotUsername && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--color-border)]" />
                </div>
                <span className="relative flex justify-center text-xs uppercase text-[var(--color-muted-foreground)]">
                  <span className="bg-[var(--color-card)] px-2">или</span>
                </span>
              </div>

              <div className="flex justify-center">
                <TelegramLoginButton
                  botUsername={telegramBotUsername}
                  onLinked={() => router.push("/account")}
                  onError={(msg) => setError(msg)}
                />
              </div>
              <p className="mt-3 text-center text-xs text-[var(--color-muted-foreground)]">
                Вход через Telegram работает после регистрации по email.
              </p>
            </>
          )}

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            {mode === "signin" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {mode === "signin" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
