// YooKassa client — single provider for site + fake-mode emulator.
// Modes (YOOKASSA_MODE):
//   "fake" — no network: payments are emulated; confirmation_url points at the
//            local /pay/fake/<id> checkout, state lives in orders.paymentId +
//            orders.paymentStatus. Идемпотентность и статусы те же, что в бою.
//   "test" — real api.yookassa.ru with test-shop credentials + test cards.
//   "live" — real api.yookassa.ru with production credentials.
// Receipt (54-ФЗ) is sent along with the payment («Платёж и чек одновременно»);
// fake mode ignores it.

import { db, orders } from "@aquaflow/database";
import { eq } from "drizzle-orm";

const MODE = (process.env.YOOKASSA_MODE ?? "fake") as "fake" | "test" | "live";
const SHOP_ID = process.env.YOOKASSA_SHOP_ID ?? "";
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY ?? "";
const API_URL = "https://api.yookassa.ru/v3";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Ставка НДС в чеке (vat_code ЮKassa): 1 = «Без НДС».
const VAT_CODE = Number(process.env.YOOKASSA_VAT_CODE ?? 1);
// Код системы налогообложения ЮKassa (taxation_system_code): 2 = УСН «Доходы».
const TAX_SYSTEM = Number(process.env.YOOKASSA_TAXATION_CODE ?? 2);

export function yookassaMode(): "fake" | "test" | "live" {
  return MODE;
}

export interface YkReceiptItem {
  name: string;
  quantity: number;
  priceCents: number;
}

export interface CreatePaymentInput {
  orderUuid: string;
  amountCents: number;
  description: string;
  returnUrl: string;
  customerContact?: string | null;
  receiptItems?: YkReceiptItem[];
}

export interface YkPayment {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled" | string;
  confirmationUrl: string | null;
}

function rubFromCents(cents: number): string {
  return (Math.round(cents) / 100).toFixed(2);
}

function buildReceipt(input: CreatePaymentInput) {
  if (!input.receiptItems?.length || !input.customerContact) return undefined;
  return {
    customer: { contact: input.customerContact },
    taxation_system_code: TAX_SYSTEM,
    items: input.receiptItems.map((it) => ({
      description: it.name.slice(0, 128),
      quantity: it.quantity.toFixed(2),
      amount: { value: rubFromCents(it.priceCents), currency: "RUB" },
      vat_code: VAT_CODE,
      payment_subject: "commodity",
      payment_mode: "full_prepayment",
    })),
  };
}

async function ykApiRequest(
  method: "GET" | "POST",
  path: string,
  body: unknown,
  idempotenceKey?: string
): Promise<unknown> {
  const auth = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };
  if (idempotenceKey) headers["Idempotence-Key"] = idempotenceKey;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YooKassa API ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function mapYkPayment(p: unknown): YkPayment {
  const obj = p as {
    id: string;
    status: YkPayment["status"];
    confirmation?: { confirmation_url?: string };
  };
  return {
    id: obj.id,
    status: obj.status,
    confirmationUrl: obj.confirmation?.confirmation_url ?? null,
  };
}

export async function createPayment(input: CreatePaymentInput): Promise<YkPayment> {
  if (MODE === "fake") {
    const id = `fake_${crypto.randomUUID()}`;
    return {
      id,
      status: "pending",
      confirmationUrl: `${APP_URL}/pay/fake/${id}`,
    };
  }

  const body = {
    amount: { value: rubFromCents(input.amountCents), currency: "RUB" },
    capture: true,
    confirmation: { type: "redirect", return_url: input.returnUrl },
    description: input.description.slice(0, 128),
    metadata: { order_id: input.orderUuid },
    receipt: buildReceipt(input),
  };
  const created = mapYkPayment(await ykApiRequest("POST", "/payments", body, `order-${input.orderUuid}`));
  return created;
}

export async function getPayment(paymentId: string): Promise<YkPayment | null> {
  if (MODE === "fake") {
    if (!paymentId.startsWith("fake_")) return null;
    const [order] = await db
      .select({ paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.paymentId, paymentId))
      .limit(1);
    if (!order) return null;
    return {
      id: paymentId,
      status: order.paymentStatus === "paid" ? "succeeded" : order.paymentStatus === "failed" ? "canceled" : "pending",
      confirmationUrl: `${APP_URL}/pay/fake/${paymentId}`,
    };
  }
  return mapYkPayment(await ykApiRequest("GET", `/payments/${paymentId}`, null));
}

export async function createRefund(
  paymentId: string,
  amountCents: number,
  refundIdempotenceKey: string
): Promise<{ id: string; status: string }> {
  if (MODE === "fake") {
    return { id: `fake_refund_${crypto.randomUUID()}`, status: "succeeded" };
  }
  const refund = (await ykApiRequest(
    "POST",
    "/refunds",
    { payment_id: paymentId, amount: { value: rubFromCents(amountCents), currency: "RUB" } },
    refundIdempotenceKey
  )) as { id: string; status: string };
  return { id: refund.id, status: refund.status };
}
