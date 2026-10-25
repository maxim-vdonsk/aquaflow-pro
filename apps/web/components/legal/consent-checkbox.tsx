"use client";

import * as React from "react";
import Link from "next/link";

export const CONSENT_ERROR =
  "Для оформления заказа необходимо выдать согласие на обработку персональных данных (чекбокс под формой)";

export function ConsentCheckbox({
  checked,
  onChange,
  idPrefix = "consent",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  idPrefix?: string;
}) {
  const id = `${idPrefix}-pdn`;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
      />
      <label htmlFor={id} className="text-xs leading-relaxed text-[var(--color-muted-foreground)]">
        Я даю отдельное согласие на обработку моих персональных данных (
        <a
          href="/consent"
          target="_blank"
          className="text-[var(--color-primary)] underline hover:opacity-80"
        >
          текст согласия
        </a>
        ) в целях оформления заказа и ознакомлен с{" "}
        <a
          href="/privacy"
          target="_blank"
          className="text-[var(--color-primary)] underline hover:opacity-80"
        >
          Политикой обработки персональных данных
        </a>
        . Отозвать согласие можно в любой момент по e-mail, указанному в Политике.
      </label>
    </div>
  );
}

// Пустой unchecked checkbox обязателен (ст. 9 152-ФЗ): состояние хранит родитель,
// onSubmit родителя блокирует отправку без согласия.