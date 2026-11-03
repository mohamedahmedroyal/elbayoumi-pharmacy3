import { describe, it, expect } from 'vitest';
import { fromEGP, add, mulQty, MoneyError } from './money';

describe('money', () => {
  it('parses integers', () => { expect(fromEGP('100')).toBe(10000); });
  it('exactness', () => { expect(add(fromEGP('0.10'), fromEGP('0.20'))).toBe(30); });
  it('mul', () => { expect(mulQty(1250, 1.5)).toBe(1875); });
  it('rejects 3+ decimals', () => expect(() => fromEGP('12.345')).toThrow(MoneyError));
});
