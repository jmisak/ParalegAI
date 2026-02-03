import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TemplateRepository } from './template.repository';
import { TemplateEngine } from './template.engine';
import {
  TemplateDefinition,
  TemplateCategory,
  TemplateVariable,
  ResolutionContext,
  RenderResult,
} from './template.types';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly templateEngine: TemplateEngine,
  ) {}

  /**
   * Create a new document template
   */
  async create(
    data: {
      name: string;
      description: string;
      category: TemplateCategory;
      content: string;
      variables?: TemplateVariable[];
      jurisdiction?: string;
    },
    userId: string,
    organizationId: string,
  ): Promise<TemplateDefinition> {
    // Auto-extract variables from content if not provided
    const variables =
      data.variables || this.autoExtractVariables(data.content);

    this.logger.log(`Creating template: ${data.name}`);

    return this.templateRepository.create({
      ...data,
      variables,
      organizationId,
      createdBy: userId,
    });
  }

  /**
   * Get a template by ID
   */
  async findOne(
    id: string,
    organizationId: string,
  ): Promise<TemplateDefinition> {
    const template = await this.templateRepository.findById(id, organizationId);

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * List templates with filtering
   */
  async findAll(
    organizationId: string,
    filter?: {
      category?: TemplateCategory;
      search?: string;
      jurisdiction?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    },
  ) {
    return this.templateRepository.findMany(organizationId, filter, pagination);
  }

  /**
   * Update a template
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      content?: string;
      variables?: TemplateVariable[];
      jurisdiction?: string;
    },
    userId: string,
    organizationId: string,
  ): Promise<TemplateDefinition> {
    await this.findOne(id, organizationId);

    return this.templateRepository.update(id, {
      ...data,
      updatedBy: userId,
    }, organizationId);
  }

  /**
   * Delete a template (soft delete)
   */
  async remove(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<void> {
    await this.findOne(id, organizationId);
    await this.templateRepository.softDelete(id, userId, organizationId);
  }

  /**
   * Render a template with provided context
   *
   * @param templateId - Template ID to render
   * @param context - Data context for variable resolution
   * @param organizationId - Tenant organization
   * @returns Rendered content
   */
  async render(
    templateId: string,
    context: ResolutionContext,
    organizationId: string,
  ): Promise<RenderResult> {
    const template = await this.findOne(templateId, organizationId);

    this.logger.log(`Rendering template: ${template.name} (v${template.version})`);

    try {
      return this.templateEngine.render(
        template.content,
        template.variables,
        context,
      );
    } catch (error) {
      this.logger.error(
        `Template render failed for ${template.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException(
        `Failed to render template "${template.name}". Please check the template content and variables.`,
      );
    }
  }

  /**
   * Preview a template render without saving
   */
  async preview(
    content: string,
    variables: TemplateVariable[],
    context: ResolutionContext,
  ): Promise<RenderResult> {
    return this.templateEngine.render(content, variables, context);
  }

  /**
   * Validate a template can be rendered with the given context
   */
  async validate(
    templateId: string,
    context: ResolutionContext,
    organizationId: string,
  ): Promise<{ valid: boolean; missing: string[] }> {
    const template = await this.findOne(templateId, organizationId);

    return this.templateEngine.validate(template.variables, context);
  }

  /**
   * Clone a template
   */
  async clone(
    templateId: string,
    newName: string,
    userId: string,
    organizationId: string,
  ): Promise<TemplateDefinition> {
    const original = await this.findOne(templateId, organizationId);

    return this.templateRepository.create({
      name: newName,
      description: `Cloned from: ${original.name}`,
      category: original.category,
      content: original.content,
      variables: original.variables,
      jurisdiction: original.jurisdiction,
      organizationId,
      createdBy: userId,
    });
  }

  /**
   * Auto-extract variables from template content
   */
  private autoExtractVariables(content: string): TemplateVariable[] {
    const keys = this.templateEngine.extractVariableKeys(content);

    return keys.map((key) => ({
      key,
      label: this.keyToLabel(key),
      type: this.guessType(key) as TemplateVariable['type'],
      required: true,
      source: 'manual',
    }));
  }

  /**
   * Convert variable key to human-readable label
   */
  private keyToLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Guess variable type from key name
   */
  private guessType(key: string): string {
    const lower = key.toLowerCase();

    if (lower.includes('date') || lower.includes('_at')) return 'date';
    if (lower.includes('amount') || lower.includes('price') || lower.includes('cost')) return 'currency';
    if (lower.includes('address')) return 'address';
    if (lower.includes('count') || lower.includes('number') || lower.includes('qty')) return 'number';
    if (lower.startsWith('is_') || lower.startsWith('has_')) return 'boolean';

    return 'text';
  }
}
