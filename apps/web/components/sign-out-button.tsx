"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await authClient.signOut();
        } catch {
          // ignore — всё равно сбрасываем состояние жёсткой перезагрузкой
        }
        // Жёсткая перезагрузка вместо router.push: мягкая навигация Next
        // не сбрасывает react session-atom и кэш страницы — UI оставался
        // залогиненным несмотря на убитую куку.
        window.location.href = "/";
      }}
    >
      Выйти
    </Button>
  );
}
