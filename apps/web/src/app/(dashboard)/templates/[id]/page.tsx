'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Layers,
  Globe,
  Info,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useTemplate,
  useRenderTemplate,
  getCategoryLabel,
  categoryColors,
  type TemplateVariable,
} from '@/lib/hooks/use-templates';

// ---------------------------------------------------------------------------
// Variable input renderer
// ---------------------------------------------------------------------------

function VariableInput({
  variable,
  value,
  onChange,
}: {
  variable: TemplateVariable;
  value: string | boolean;
  onChange: (val: string | boolean) => void;
}) {
  const id = `var-${variable.key}`;

  switch (variable.type) {
    case 'boolean':
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={value === true || value === 'true'}
            onClick={() => onChange(!(value === true || value === 'true'))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value === true || value === 'true' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value === true || value === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <label htmlFor={id} className="text-sm text-foreground">
            {value === true || value === 'true' ? 'Yes' : 'No'}
          </label>
        </div>
      );

    case 'select':
      return (
        <select
          id={id}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select...</option>
          {variable.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <Input
          id={id}
          type="date"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'currency':
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="pl-7"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    default:
      return (
        <Input
          id={id}
          type="text"
          placeholder={variable.label}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { template, isLoading, error } = useTemplate(id);
  const renderMutation = useRenderTemplate();
  const [variableValues, setVariableValues] = useState<Record<string, string | boolean>>({});
  const [renderedContent, setRenderedContent] = useState<string | null>(null);

  const setVariable = useCallback((key: string, value: string | boolean) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Initialise defaults once template loads
  const getEffectiveValue = (v: TemplateVariable): string | boolean => {
    if (variableValues[v.key] !== undefined) return variableValues[v.key];
    if (v.type === 'boolean') return v.defaultValue === 'true';
    return v.defaultValue ?? '';
  };

  const handlePreview = async () => {
    if (!template) return;

    const vars: Record<string, string | boolean> = {};
    template.variables.forEach((v) => {
      vars[v.key] = getEffectiveValue(v);
    });

    const result = await renderMutation.mutateAsync({
      templateId: template.id,
      variables: vars,
    });
    setRenderedContent(result.content);
  };

  // ---------------------------------------------------------------------------
  // Loading / Error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading template details...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/templates">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Template not found or an error occurred.
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const requiredCount = template.variables.filter((v) => v.required).length;
  const filledRequired = template.variables.filter(
    (v) => v.required && getEffectiveValue(v) !== '' && getEffectiveValue(v) !== false
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/templates">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              categoryColors[template.category] ?? 'bg-muted text-muted-foreground'
            }`}
          >
            {getCategoryLabel(template.category)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            v{template.version}
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Variable form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Use Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {template.variables.map((v) => (
                <div key={v.key} className="space-y-1.5">
                  <label
                    htmlFor={`var-${v.key}`}
                    className="text-sm font-medium text-foreground flex items-center gap-1.5"
                  >
                    {v.label}
                    {v.required && <span className="text-danger-500">*</span>}
                  </label>
                  <VariableInput
                    variable={v}
                    value={getEffectiveValue(v)}
                    onChange={(val) => setVariable(v.key, val)}
                  />
                </div>
              ))}

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button onClick={handlePreview} disabled={renderMutation.isPending}>
                  <Eye className="w-4 h-4 mr-2" />
                  {renderMutation.isPending ? 'Generating...' : 'Preview'}
                </Button>
                <Button variant="outline" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Download as PDF
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                  {filledRequired}/{requiredCount} required fields filled
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Rendered preview */}
          {renderedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Document Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-4 font-mono leading-relaxed overflow-x-auto">
                  {renderedContent}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Template info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Template Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Jurisdiction</div>
                <div className="flex items-center gap-2 mt-1 font-medium">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {template.jurisdiction}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="mt-1 font-medium">v{template.version}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1 font-medium capitalize">{template.status}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="mt-1 font-medium">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="mt-1 font-medium">
                  {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variable definitions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Variable Definitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.variables.map((v) => (
                  <div
                    key={v.key}
                    className="flex items-start gap-2 text-sm"
                  >
                    {v.required ? (
                      <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{v.label}</div>
                      <div className="text-muted-foreground">
                        {v.type}
                        {v.required ? '' : ' (optional)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
