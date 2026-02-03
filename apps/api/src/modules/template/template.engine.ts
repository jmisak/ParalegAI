import { Injectable, Logger } from '@nestjs/common';
import {
  TemplateVariable,
  ResolutionContext,
  RenderResult,
  VariableType,
} from './template.types';

/**
 * Template Engine
 *
 * Renders document templates by resolving variables from context data.
 * Supports nested variable references, conditional blocks, and formatting.
 *
 * Variable syntax:
 *   {{variable_key}} - Simple replacement
 *   {{variable_key|format}} - With format specifier
 *   {{#if variable_key}}...{{/if}} - Conditional block
 *   {{#each list_key}}...{{/each}} - List iteration
 */
@Injectable()
export class TemplateEngine {
  private readonly logger = new Logger(TemplateEngine.name);

  /**
   * Render a template with the given context
   *
   * @param template - Template content with variable placeholders
   * @param variables - Variable definitions
   * @param context - Resolution context with data sources
   * @returns Rendered content and metadata
   */
  render(
    template: string,
    variables: TemplateVariable[],
    context: ResolutionContext,
  ): RenderResult {
    const warnings: string[] = [];
    const unresolvedVariables: string[] = [];

    // Build variable map from context
    const resolvedValues = this.resolveVariables(variables, context, warnings);

    // Process conditional blocks first
    let content = this.processConditionals(template, resolvedValues);

    // Process each blocks
    content = this.processEachBlocks(content, resolvedValues, context);

    // Replace simple variables
    content = this.replaceVariables(content, resolvedValues, unresolvedVariables);

    // Clean up any remaining unresolved variable markers
    content = this.cleanUpUnresolved(content);

    return {
      content,
      unresolvedVariables,
      warnings,
    };
  }

  /**
   * Validate that all required variables can be resolved
   */
  validate(
    variables: TemplateVariable[],
    context: ResolutionContext,
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const variable of variables) {
      if (!variable.required) continue;

      const value = this.resolveValue(variable, context);
      if (value === null || value === undefined || value === '') {
        missing.push(variable.key);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Extract all variable keys from a template string
   */
  extractVariableKeys(template: string): string[] {
    const keys = new Set<string>();
    const simpleRegex = /\{\{([^#/|}\s]+)(?:\|[^}]*)?\}\}/g;

    let match;
    while ((match = simpleRegex.exec(template)) !== null) {
      if (match[1]) {
        keys.add(match[1]);
      }
    }

    return [...keys];
  }

  /**
   * Resolve all variables from context
   */
  private resolveVariables(
    variables: TemplateVariable[],
    context: ResolutionContext,
    warnings: string[],
  ): Map<string, string> {
    const resolved = new Map<string, string>();

    for (const variable of variables) {
      const value = this.resolveValue(variable, context);

      if (value !== null && value !== undefined) {
        const formatted = this.formatValue(value, variable.type);
        resolved.set(variable.key, formatted);
      } else if (variable.defaultValue !== undefined) {
        resolved.set(variable.key, variable.defaultValue);
      } else if (variable.required) {
        warnings.push(`Required variable "${variable.key}" could not be resolved`);
      }
    }

    return resolved;
  }

  /**
   * Resolve a single variable value from context
   */
  private resolveValue(
    variable: TemplateVariable,
    context: ResolutionContext,
  ): unknown {
    // Check custom values first (manual input overrides auto-resolution)
    if (context.custom && variable.key in context.custom) {
      return context.custom[variable.key];
    }

    // Auto-resolve from source
    if (variable.source && variable.sourcePath) {
      const sourceData = this.getSourceData(variable.source, context);
      if (sourceData) {
        return this.getNestedValue(sourceData, variable.sourcePath);
      }
    }

    // Fallback: try to find in any context source
    return this.searchAllSources(variable.key, context);
  }

  /**
   * Get data source from context
   */
  private getSourceData(
    source: string,
    context: ResolutionContext,
  ): Record<string, unknown> | null {
    switch (source) {
      case 'matter':
        return (context.matter as Record<string, unknown>) || null;
      case 'property':
        return (context.property as Record<string, unknown>) || null;
      case 'organization':
        return (context.organization as Record<string, unknown>) || null;
      case 'transaction':
        return (context.transaction as Record<string, unknown>) || null;
      default:
        return null;
    }
  }

  /**
   * Get a nested value using dot notation path
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  /**
   * Search all context sources for a matching key
   */
  private searchAllSources(key: string, context: ResolutionContext): unknown {
    const sources = [
      context.matter,
      context.property,
      context.organization,
      context.transaction,
    ];

    for (const source of sources) {
      if (!source) continue;
      if (key in source) return source[key];
    }

    return undefined;
  }

  /**
   * Format a value based on its type
   */
  private formatValue(value: unknown, type: VariableType): string {
    if (value === null || value === undefined) return '';

    switch (type) {
      case 'date':
        return this.formatDate(value);
      case 'currency':
        return this.formatCurrency(value);
      case 'number':
        return this.formatNumber(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'address':
        return this.formatAddress(value);
      default:
        return String(value);
    }
  }

  private formatDate(value: unknown): string {
    try {
      const date = value instanceof Date ? value : new Date(String(value));
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return String(value);
    }
  }

  private formatCurrency(value: unknown): string {
    try {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num);
    } catch {
      return String(value);
    }
  }

  private formatNumber(value: unknown): string {
    try {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return new Intl.NumberFormat('en-US').format(num);
    } catch {
      return String(value);
    }
  }

  private formatAddress(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      const addr = value as Record<string, unknown>;
      const parts = [
        addr['street'],
        addr['unit'] ? `Unit ${addr['unit']}` : null,
        `${addr['city'] || ''}, ${addr['state'] || ''} ${addr['zip'] || ''}`.trim(),
      ].filter(Boolean);
      return parts.join('\n');
    }
    return String(value);
  }

  /**
   * Process {{#if key}}...{{/if}} conditional blocks
   */
  private processConditionals(
    template: string,
    values: Map<string, string>,
  ): string {
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)(?:\{\{#else\}\}([\s\S]*?))?\{\{\/if\}\}/g;

    return template.replace(ifRegex, (_match, key: string, ifBlock: string, elseBlock?: string) => {
      const value = values.get(key);
      const isTruthy = value !== undefined && value !== '' && value !== 'No' && value !== 'false';

      if (isTruthy) {
        return ifBlock;
      }

      return elseBlock || '';
    });
  }

  /**
   * Process {{#each key}}...{{/each}} iteration blocks
   */
  private processEachBlocks(
    template: string,
    values: Map<string, string>,
    context: ResolutionContext,
  ): string {
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return template.replace(eachRegex, (_match, key: string, block: string) => {
      // Try to find list data in context
      let items: unknown[] = [];

      // Check custom first
      const customValue = context.custom?.[key];
      if (customValue) {
        try {
          items = JSON.parse(customValue);
        } catch {
          items = [];
        }
      }

      // Check other sources
      if (items.length === 0) {
        const sources = [context.matter, context.property, context.organization];
        for (const source of sources) {
          if (source && key in source && Array.isArray(source[key])) {
            items = source[key] as unknown[];
            break;
          }
        }
      }

      if (items.length === 0) return '';

      return items
        .map((item, index) => {
          let rendered = block;
          // Replace {{@index}} with current index
          rendered = rendered.replace(/\{\{@index\}\}/g, String(index + 1));

          // Replace {{this}} for simple arrays
          if (typeof item === 'string' || typeof item === 'number') {
            rendered = rendered.replace(/\{\{this\}\}/g, String(item));
          }

          // Replace {{prop}} for object arrays
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            for (const [prop, val] of Object.entries(obj)) {
              const propRegex = new RegExp(`\\{\\{${prop}\\}\\}`, 'g');
              rendered = rendered.replace(propRegex, String(val ?? ''));
            }
          }

          return rendered;
        })
        .join('');
    });
  }

  /**
   * Replace simple {{variable}} placeholders
   */
  private replaceVariables(
    template: string,
    values: Map<string, string>,
    unresolvedVariables: string[],
  ): string {
    const varRegex = /\{\{(\w+)(?:\|(\w+))?\}\}/g;

    return template.replace(varRegex, (match, key: string, format?: string) => {
      const value = values.get(key);

      if (value === undefined) {
        unresolvedVariables.push(key);
        return match; // Leave unresolved
      }

      // Apply inline format if specified
      if (format) {
        return this.applyFormat(value, format);
      }

      return value;
    });
  }

  /**
   * Apply inline format specifiers
   */
  private applyFormat(value: string, format: string): string {
    switch (format) {
      case 'upper':
        return value.toUpperCase();
      case 'lower':
        return value.toLowerCase();
      case 'title':
        return value.replace(
          /\w\S*/g,
          (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase(),
        );
      default:
        return value;
    }
  }

  /**
   * Remove any remaining unresolved variable markers for final output
   */
  private cleanUpUnresolved(content: string): string {
    // Replace unresolved variables with blank underlines for review
    return content.replace(
      /\{\{(\w+)(?:\|(\w+))?\}\}/g,
      '____________',
    );
  }
}
