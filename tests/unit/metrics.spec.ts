import { describe, it, expect } from 'vitest';
import { formatInteger, formatCurrency } from '../../src/utils/metrics';

describe('metrics utils', () => {
  it('formats integers', () => {
    expect(formatInteger(1234567)).toMatch(/1[,\s]?234[,\s]?567/);
  });
  it('formats currency', () => {
    const v = formatCurrency(123.45);
    expect(v).toMatch(/123\.45|123,45/);
  });
});


