'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useMatterDetail,
  useUpdateMatter,
  type UpdateMatterInput,
} from '@/lib/hooks/use-matter';
import { MatterForm } from '../../_components/matter-form';

export default function EditMatterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { matter, isLoading, error } = useMatterDetail(id);
  const updateMatter = useUpdateMatter(id);

  function handleSubmit(data: UpdateMatterInput) {
    updateMatter.mutate(data, {
      onSuccess: () => {
        router.push(`/dashboard/matters/${id}`);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading matter...</div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/matters">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matters
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Matter not found or an error occurred.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/matters/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Matter</h1>
          <p className="text-muted-foreground">
            {matter.name} &mdash; {matter.matterNumber}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <MatterForm
          initialData={matter}
          isEditing
          onSubmit={handleSubmit}
          isSubmitting={updateMatter.isPending}
          cancelHref={`/dashboard/matters/${id}`}
        />

        {updateMatter.isError && (
          <p className="mt-4 text-sm text-danger-500">
            Failed to update matter. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
