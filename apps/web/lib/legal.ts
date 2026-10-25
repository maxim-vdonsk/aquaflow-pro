// Единый источник юридических данных оператора (152-ФЗ «О персональных
// данных»). Реквизиты НЕ коммитятся в git: читаются из env LEGAL_* в .env
// (сервер) и .env.local (локально). .env.example содержит ключи без значений.
const env = (key: string, fallback: string) =>
  (process.env[key] || fallback).trim();

export const OPERATOR = {
  legalName: env("LEGAL_OPERATOR_NAME", "ИП ___"),
  shortName: env("LEGAL_OPERATOR_SHORT", "ИП"),
  ogrnip: env("LEGAL_OGRNIP", ""),
  inn: env("LEGAL_INN", ""),
  address: env("LEGAL_ADDRESS", ""),
  bankAccount: env("LEGAL_BANK_ACCOUNT", ""),
  bank: env("LEGAL_BANK_NAME", ""),
  bik: env("LEGAL_BIK", ""),
  phone: env("LEGAL_PHONE", ""),
  email: env("LEGAL_EMAIL", ""),
};

// Версия текста согласия (ч.4 ст.9 152-ФЗ). При изменении текста согласия
// поднять значение — новые согласия логируются в consent_records.
export const PDN_CONSENT_VERSION = "2026-10-25.1";

export const SITE_NAME = "иван-вода.рф";

// Для показа человеку (тексты документов) — кириллица, НЕ пуникод-запись.
export const SITE_URL = "https://иван-вода.рф";