'use client';

import { toast } from 'sonner';
import { StatsGrid } from '@/components/stats-grid';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRequestTags } from '@/modules/request-tags/hooks/use-request-tags';
import { useDeleteRequestTags } from '@/modules/request-tags/hooks/use-delete-request-tags';

export function RequestTagsActions() {
  const { data, isLoading, refetch } = useRequestTags();
  const deleteMutation = useDeleteRequestTags();

  const tags = data?.tags ?? [];
  const totalTags = tags.length;

  const handleDelete = async () => {
    try {
      const result = await deleteMutation.mutateAsync();
      toast.success(`Successfully deleted ${result.deleted} records`);
    } catch (error) {
      toast.error('Failed to delete records', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Statistics
  const categorizedCount = tags.filter((t) => t.categorizacion !== 'No asignado').length;
  const withJiraCount = tags.filter((t) => t.jira !== 'No asignado').length;
  const linkedCount = tags.filter((t) => t.linkedRequestId !== 'No asignado').length;

  const statsData = [
    { label: 'TOTAL TAGS', value: totalTags.toLocaleString(), color: 'purple' as const },
    {
      label: 'CATEGORIZED',
      value: `${categorizedCount.toLocaleString()} (${totalTags > 0 ? Math.round((categorizedCount / totalTags) * 100) : 0}%)`,
      color: 'cyan' as const,
    },
    {
      label: 'WITH JIRA',
      value: `${withJiraCount.toLocaleString()} (${totalTags > 0 ? Math.round((withJiraCount / totalTags) * 100) : 0}%)`,
      color: 'orange' as const,
    },
    {
      label: 'LINKED',
      value: `${linkedCount.toLocaleString()} (${totalTags > 0 ? Math.round((linkedCount / totalTags) * 100) : 0}%)`,
      color: 'emerald' as const,
    },
  ];

  const loading = isLoading || deleteMutation.isPending;

  return (
    <>
      {/* Statistics */}
      {statsData.length > 0 && (
        <StatsGrid
          stats={statsData}
          onRefresh={() => refetch()}
          loading={loading}
        />
      )}

      {/* Delete All Dialog */}
      {tags.length > 0 && (
        <div className="mb-8 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="gap-2 border-red-500/50 text-red-200 hover:text-red-100 hover:bg-red-600/30 hover:border-red-500/70 bg-red-600/20 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all request tags?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {tags.length.toLocaleString()} records from the request tags table. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
