export const PIASTERS_PER_EGP = 100; export const QTY_SCALE = 10000;
export class MoneyError extends Error {} export type Piasters = number;

export function fromEGP(input: number | string): Piasters {
  const s = typeof input === 'string' ? input.trim() : String(input);
  if (!/^-?\d+(\.\d{1,2})?$/.test(s)) throw new MoneyError(`Invalid EGP "${input}"`);
  const neg = s.startsWith('-'); const body = neg ? s.slice(1) : s; const [whole, frac = ''] = body.split('.');
  const v = Number(whole) * PIASTERS_PER_EGP + Number((frac + '00').slice(0, 2));
  if (!Number.isSafeInteger(v)) throw new MoneyError('Overflow'); return neg ? -v : v;
}

export function toEGP(p: Piasters): number { return p / PIASTERS_PER_EGP; }

export function add(a: Piasters, b: Piasters): Piasters { const r = a + b; if (!Number.isSafeInteger(r)) throw new MoneyError('Overflow add'); return r; }

export function sub(a: Piasters, b: Piasters): Piasters { const r = a - b; if (!Number.isSafeInteger(r)) throw new MoneyError('Overflow sub'); return r; }

export function mulQty(p: Piasters, qty: number): Piasters {
  const qs = Math.round(qty * QTY_SCALE); if (Math.abs(qty * QTY_SCALE - qs) > 1e-6) throw new MoneyError(`Qty >4 decimals: ${qty}`);
  const num = BigInt(p) * BigInt(qs); const den = BigInt(QTY_SCALE); const q = num / den; const rem = num % den;
  const absRem = rem < 0n ? -rem : rem; const sign = num < 0n ? -1n : 1n; const rounded = absRem * 2n >= den ? q + sign : q;
  const r = Number(rounded); if (!Number.isSafeInteger(r)) throw new MoneyError('Overflow mul'); return r;
}

export function sum(v: Piasters[]): Piasters { return v.reduce((a, x) => add(a, x), 0); }
export function isZero(p: Piasters): boolean { return p === 0; }
export function cmp(a: Piasters, b: Piasters): -1 | 0 | 1 { return a < b ? -1 : a > b ? 1 : 0; }
