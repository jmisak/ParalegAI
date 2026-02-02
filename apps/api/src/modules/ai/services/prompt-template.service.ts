import { Injectable, NotFoundException } from '@nestjs/common';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  template: string;
  variables: string[];
}

/**
 * Prompt Template Service
 * Manages version-controlled prompt templates for AI operations
 */
@Injectable()
export class PromptTemplateService {
  private readonly templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Get a compiled prompt template with variables
   */
  async getTemplate(
    templateId: string,
    variables: Record<string, unknown>,
  ): Promise<string> {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new NotFoundException(`Prompt template '${templateId}' not found`);
    }

    return this.compileTemplate(template.template, variables);
  }

  /**
   * List all available templates
   */
  async listTemplates(): Promise<Array<Omit<PromptTemplate, 'template'>>> {
    return Array.from(this.templates.values()).map(({ template: _template, ...rest }) => rest);
  }

  /**
   * Compile template with variables
   */
  private compileTemplate(
    template: string,
    variables: Record<string, unknown>,
  ): string {
    let compiled = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      compiled = compiled.replace(placeholder, String(value ?? ''));
    }

    return compiled;
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    this.templates.set('document_analysis', {
      id: 'document_analysis',
      name: 'Document Analysis',
      description: 'Analyze legal documents for key information',
      version: '1.0.0',
      variables: ['content', 'documentType', 'analysisType'],
      template: `You are an expert legal analyst specializing in real estate law. Analyze the following document and provide a comprehensive summary.

Document Type: {{ documentType }}
Analysis Focus: {{ analysisType }}

DOCUMENT CONTENT:
---
{{ content }}
---

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Parties Identified
3. Important Dates and Deadlines
4. Key Terms and Conditions
5. Potential Issues or Red Flags
6. Recommended Actions

Format your response in clear sections with headers. Be precise and cite specific sections when relevant.`,
    });

    this.templates.set('document_generation', {
      id: 'document_generation',
      name: 'Document Generation',
      description: 'Generate legal document content from templates',
      version: '1.0.0',
      variables: ['templateType', 'context', 'variables'],
      template: `You are an expert legal document drafter specializing in real estate transactions. Generate professional legal document content based on the following specifications.

Document Template Type: {{ templateType }}

Context and Requirements:
{{ context }}

Variables to incorporate:
{{ variables }}

IMPORTANT GUIDELINES:
1. Use precise legal language appropriate for real estate transactions
2. Include all standard protective clauses
3. Ensure compliance with general real estate law principles
4. Flag any areas requiring attorney review with [ATTORNEY REVIEW REQUIRED]
5. Use proper formatting with numbered sections

Generate the document content:`,
    });

    this.templates.set('contract_review', {
      id: 'contract_review',
      name: 'Contract Review',
      description: 'AI-assisted contract review and risk assessment',
      version: '1.0.0',
      variables: ['content', 'reviewFocus'],
      template: `You are a senior real estate attorney conducting a thorough contract review. Analyze the following contract with particular attention to protecting the client's interests.

Review Focus: {{ reviewFocus }}

CONTRACT TEXT:
---
{{ content }}
---

Provide a comprehensive review including:

1. RISK ASSESSMENT
   - High Risk Items (immediate attention required)
   - Medium Risk Items (should be addressed)
   - Low Risk Items (minor concerns)

2. MISSING OR INCOMPLETE PROVISIONS
   - Standard clauses that are absent
   - Provisions that need clarification

3. UNFAVORABLE TERMS
   - Clauses that favor the other party
   - Suggested modifications

4. COMPLIANCE CHECK
   - Potential regulatory issues
   - Standard practice deviations

5. RECOMMENDED CHANGES
   - Specific redline suggestions
   - Priority order for negotiations

6. SUMMARY RECOMMENDATION
   - Overall assessment
   - Proceed/Caution/Do Not Sign recommendation

Be thorough but concise. Cite specific sections and clauses.`,
    });

    this.templates.set('title_review', {
      id: 'title_review',
      name: 'Title Review',
      description: 'Analyze title documents and identify issues',
      version: '1.0.0',
      variables: ['content', 'propertyAddress'],
      template: `You are a title examiner reviewing title documents for a real estate transaction.

Property Address: {{ propertyAddress }}

TITLE DOCUMENTS:
---
{{ content }}
---

Analyze and report on:

1. CHAIN OF TITLE
   - Ownership history summary
   - Any gaps or irregularities

2. ENCUMBRANCES
   - Existing liens and mortgages
   - Easements and restrictions
   - Covenants and conditions

3. TITLE DEFECTS
   - Identified issues
   - Severity assessment
   - Recommended curative actions

4. SURVEY MATTERS
   - Boundary concerns
   - Encroachment issues

5. TITLE INSURANCE RECOMMENDATIONS
   - Standard exceptions to note
   - Special endorsements needed

6. CLEARANCE REQUIREMENTS
   - Items needed before closing
   - Estimated timeline

Provide a clear, professional analysis suitable for attorney review.`,
    });
  }
}
