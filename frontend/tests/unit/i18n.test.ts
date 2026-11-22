import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/en.json';
import id from '../../src/i18n/id.json';
import { t } from '../../src/i18n';

describe('i18n', () => {
  it('has identical keys in id and en', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(id).sort());
  });

  it('interpolates params', () => {
    expect(t('hello.subtitle', { brand: 'Kiko' })).toContain('Kiko');
  });

  it('keeps placeholder when param is missing', () => {
    expect(t('hello.subtitle')).toContain('{brand}');
  });
});
