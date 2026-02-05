'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateMatter, type CreateMatterInput, type UpdateMatterInput } from '@/lib/hooks/use-matter';
import { MatterForm } from '../_components/matter-form';

export default function NewMatterPage() {
  const router = useRouter();
  const createMatter = useCreateMatter();

  function handleSubmit(data: CreateMatterInput | UpdateMatterInput) {
    // For new matters, data is always CreateMatterInput
    createMatter.mutate(data as CreateMatterInput, {
      onSuccess: (created) => {
        router.push(`/dashboard/matters/${created.id}`);
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/matters">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Matter</h1>
          <p className="text-muted-foreground">
            Create a new real estate matter
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <MatterForm
          onSubmit={handleSubmit}
          isSubmitting={createMatter.isPending}
          cancelHref="/dashboard/matters"
        />

        {createMatter.isError && (
          <p className="mt-4 text-sm text-danger-500">
            Failed to create matter. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
