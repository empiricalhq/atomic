import { describe, expect, it } from 'vitest';
import { hasAtMostTwoDecimals, subtractMoney, sumMoney, toCents } from './money';

describe('toCents', () => {
  it.each([
    [19.99, 1999],
    [1.005, 101],
    [0.285, 29],
    [1.255, 126],
    [-1.005, -101],
  ])('converts %d to %d cents, rounding half up on its magnitude', (amount, cents) => {
    expect(toCents(amount)).toBe(cents);
  });
});

describe('hasAtMostTwoDecimals', () => {
  it.each([
    ['5', true],
    ['5.1', true],
    ['5.12', true],
    ['5.123', false],
    ['5.1.2', false],
  ])('%s is %s', (amount, accepted) => {
    expect(hasAtMostTwoDecimals(amount)).toBe(accepted);
  });
});

describe('sumMoney', () => {
  it.each([
    [[0.1, 0.2], 0.3],
    [[10.1, 20.2, 5.05], 35.35],
    [[], 0],
  ])('sums %j to %d', (amounts, total) => {
    expect(sumMoney(amounts)).toBe(total);
  });
});

describe('subtractMoney', () => {
  it('subtracts two amounts exactly', () => {
    expect(subtractMoney(0.3, 0.1)).toBe(0.2);
  });
});
