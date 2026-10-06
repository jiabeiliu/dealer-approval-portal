export const PRODUCTS = [
  "STEM Robotics Lab",
  "Early Readers Collection",
  "Chemistry Safety Kit",
  "Math Foundations Suite",
  "Classroom Audio System",
] as const;

export type Status = "Pending" | "Approved" | "Denied";

export type DealerRequest = {
  id: string;
  dealer: string;
  email: string;
  school: string;
  district: string;
  product: string;
  quantity: number;
  reason: string;
  submittedAt: number;
  status: Status;
  decidedAt: number | null;
};

export type RequestInput = Pick<DealerRequest, "dealer" | "email" | "school" | "district" | "product" | "quantity" | "reason">;

function boundedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

export function parseRequestInput(value: unknown): RequestInput | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const dealer = boundedString(input.dealer, 120);
  const email = boundedString(input.email, 254);
  const school = boundedString(input.school, 120);
  const district = boundedString(input.district, 120);
  const product = boundedString(input.product, 100);
  const reason = boundedString(input.reason, 1000);
  const quantity = Number(input.quantity);
  if (!dealer || !email || !school || !district || !product || !reason) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!PRODUCTS.includes(product as (typeof PRODUCTS)[number])) return null;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) return null;
  return { dealer, email, school, district, product, quantity, reason };
}
