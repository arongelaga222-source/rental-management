import { revalidatePath } from 'next/cache';

export const CURRENCY_SYMBOL = '₱';
export const CURRENCY_CODE = 'PHP';

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = Number(amount) || 0;
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safely ignore if invoked outside Next.js request context (e.g. CLI or tests)
  }
}

/**
 * Deeply transforms any Prisma Decimal or non-plain data into plain JSON-safe types.
 */
export function serializeData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object') {
    // Check if Decimal or has toNumber
    if (
      (obj as unknown as { constructor?: { name?: string } })?.constructor?.name === 'Decimal' ||
      typeof (obj as unknown as { toNumber?: () => number })?.toNumber === 'function' ||
      ('d' in (obj as unknown as Record<string, unknown>) && 'e' in (obj as unknown as Record<string, unknown>) && 's' in (obj as unknown as Record<string, unknown>))
    ) {
      return Number(obj) as unknown as T;
    }
    if (obj instanceof Date) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeData) as unknown as T;
    }
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      res[key] = serializeData((obj as unknown as Record<string, unknown>)[key]);
    }
    return res as unknown as T;
  }
  return obj;
}
