import { describe, it, expect } from 'vitest';
import {
  getCategoryLabel,
  categoryColors,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from './use-templates';

describe('use-templates helpers', () => {
  describe('TEMPLATE_CATEGORIES', () => {
    it('should contain all expected categories', () => {
      const values = TEMPLATE_CATEGORIES.map((c) => c.value);
      expect(values).toContain('purchase_agreement');
      expect(values).toContain('lease');
      expect(values).toContain('deed');
      expect(values).toContain('closing');
      expect(values).toContain('title');
      expect(values).toContain('disclosure');
      expect(values).toContain('mortgage');
      expect(values).toContain('other');
      expect(TEMPLATE_CATEGORIES).toHaveLength(8);
    });

    it('should have label and value for every entry', () => {
      TEMPLATE_CATEGORIES.forEach((cat) => {
        expect(cat.value).toBeTruthy();
        expect(cat.label).toBeTruthy();
      });
    });
  });

  describe('getCategoryLabel', () => {
    it('should return human-readable labels', () => {
      expect(getCategoryLabel('purchase_agreement')).toBe('Purchase Agreement');
      expect(getCategoryLabel('lease')).toBe('Lease');
      expect(getCategoryLabel('deed')).toBe('Deed');
      expect(getCategoryLabel('closing')).toBe('Closing');
      expect(getCategoryLabel('title')).toBe('Title');
      expect(getCategoryLabel('disclosure')).toBe('Disclosure');
      expect(getCategoryLabel('mortgage')).toBe('Mortgage');
      expect(getCategoryLabel('other')).toBe('Other');
    });

    it('should fall back to the raw value for unknown categories', () => {
      // Cast to bypass TS for edge-case coverage
      expect(getCategoryLabel('nonexistent' as TemplateCategory)).toBe('nonexistent');
    });
  });

  describe('categoryColors', () => {
    it('should have a colour mapping for every category', () => {
      const categories: TemplateCategory[] = [
        'purchase_agreement',
        'lease',
        'deed',
        'closing',
        'title',
        'disclosure',
        'mortgage',
        'other',
      ];
      categories.forEach((cat) => {
        expect(categoryColors[cat]).toBeTruthy();
      });
    });
  });
});
