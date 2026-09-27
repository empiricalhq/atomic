import { describe, expect, it } from 'vitest';
import { fromCents, hasAtMostTwoDecimals, subtractMoney, sumMoney, toCents } from './money';

describe('toCents / fromCents', () => {
  it('round-trips a currency amount', () => {
    expect(toCents(19.99)).toBe(1999);
    expect(fromCents(1999)).toBe(19.99);
  });

  // Multiplying by 100 first (amount * 100) reintroduces the float error
  // toCents exists to avoid: 1.005 * 100 is 100.49999999999999 in a double,
  // not 100.5, so Math.round(amount * 100) silently rounds down. Chosen
  // instead of rejecting these at the input, since toCents is also called on
  // values a form never validated (e.g. sums and other internal amounts),
  // and it should be exact regardless of where the number came from.
  it('rounds half up exactly, without the multiplication float trap', () => {
    expect(toCents(1.005)).toBe(101);
    expect(toCents(0.285)).toBe(29);
    expect(toCents(1.255)).toBe(126);
  });

  it('rounds a negative amount half up on its magnitude', () => {
    expect(toCents(-1.005)).toBe(-101);
  });
});

describe('hasAtMostTwoDecimals', () => {
  it('accepts an amount with zero, one or two decimal digits', () => {
    expect(hasAtMostTwoDecimals('5')).toBe(true);
    expect(hasAtMostTwoDecimals('5.1')).toBe(true);
    expect(hasAtMostTwoDecimals('5.12')).toBe(true);
  });

  it('rejects an amount with three or more decimal digits', () => {
    expect(hasAtMostTwoDecimals('5.123')).toBe(false);
  });

  it('rejects more than one decimal point', () => {
    expect(hasAtMostTwoDecimals('5.1.2')).toBe(false);
  });
});

describe('sumMoney', () => {
  it('sums float amounts exactly, unlike plain addition', () => {
    expect(0.1 + 0.2).not.toBe(0.3); // the float trap this guards against
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
  });

  it('sums a list of category amounts exactly', () => {
    expect(sumMoney([10.1, 20.2, 5.05])).toBe(35.35);
  });

  it('returns 0 for an empty list', () => {
    expect(sumMoney([])).toBe(0);
  });
});

describe('subtractMoney', () => {
  it('subtracts two amounts exactly', () => {
    expect(subtractMoney(0.3, 0.1)).toBe(0.2);
  });
});
