import { describe, expect, it } from 'vitest';
import { getGreeting } from './formatters';

describe('getGreeting', () => {
  it.each([
    [0, 'Buenos días'],
    [11, 'Buenos días'],
    [12, 'Buenas tardes'],
    [17, 'Buenas tardes'],
    [18, 'Buenas noches'],
    [23, 'Buenas noches'],
  ])('greets hour %i with %s', (hour, greeting) => {
    expect(getGreeting(hour)).toBe(greeting);
  });
});
