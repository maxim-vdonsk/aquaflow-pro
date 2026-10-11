// Shared order display helpers for the cabinet (/account) and the operator
// panel (/admin): labels, styles and ru-RU formatters. Money is integer cents.

export const STATUS_LABELS: Record<string, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  preparing: "Собирается",
  delivering: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-600",
  confirmed: "text-sky-600",
  preparing: "text-sky-600",
  delivering: "text-sky-600",
  delivered: "text-emerald-600",
  cancelled: "text-red-600",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Ошибка оплаты",
  refunded: "Возврат",
};

export const moneyFmt = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export const centsToRub = (cents: number) => moneyFmt.format(cents / 100);

export const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatOrderDate = (d: Date) => dateFmt.format(d);