'use client';

import { useState, useEffect, useRef } from 'react';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRelationships } from '../hooks/use-relationships';
import { useRelationshipsStats } from '../hooks/use-relationships-stats';
import { useUploadRelationships } from '../hooks/use-upload-relationships';
import { useDeleteAllRelationships } from '../hooks/use-delete-all-relationships';
import { TopParentsTable } from './top-parents-table';
import { RecentRelationshipsTable } from './recent-relationships-table';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function RequestRelationshipsContent() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: relationshipsData, isLoading: relationshipsLoading } =
    useRelationships(100, 0);
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } =
    useRelationshipsStats();
  const uploadMutation = useUploadRelationships();
  const deleteMutation = useDeleteAllRelationships();

  const relationships = relationshipsData?.data ?? [];
  const total = relationshipsData?.total ?? 0;
  const stats = statsData ?? {
    totalRecords: 0,
    uniqueParents: 0,
    topParents: [],
  };

  const loading = relationshipsLoading || statsLoading;

  useEffect(() => {
    const savedFilename = localStorage.getItem('lastUploadedFilename');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        toast({
          title: 'Upload successful',
          description: `Imported ${result.imported} records`,
        });
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedFilename', file.name);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description:
            error instanceof Error ? error.message : 'Please try again.',
        });
      },
    });
  };

  const handleDropTable = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast({
          title: 'Success',
          description: result.message,
        });
        setShowDeleteConfirmation(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description:
            error instanceof Error ? error.message : 'Please try again.',
        });
        setShowDeleteConfirmation(false);
      },
    });
  };

  const handleRefresh = () => {
    refetchStats();
  };

  const calculateAverage = () => {
    if (stats.uniqueParents === 0) return '0.00';
    return (stats.totalRecords / stats.uniqueParents).toFixed(2);
  };

  const statsGridData = [
    {
      label: 'TOTAL RELATIONSHIPS',
      value: formatNumber(stats.totalRecords),
      color: 'cyan' as const,
    },
    {
      label: 'UNIQUE PARENT REQUESTS',
      value: formatNumber(stats.uniqueParents),
      color: 'purple' as const,
    },
    {
      label: 'AVERAGE CHILDREN',
      value: calculateAverage(),
      color: 'orange' as const,
    },
  ];

  return (
    <>
      <UploadSectionDynamic
        currentFilename={currentFilename}
        recordsCount={relationships.length}
        file={file}
        uploading={uploadMutation.isPending}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        hardcodedFilename="REP02 padre hijo.xlsx"
        title="Upload Request Relationships Report"
        description="Upload an Excel file (REP02 padre hijo) to import parent-child request relationships"
      />

      {statsGridData.length > 0 && (
        <StatsGrid
          stats={statsGridData}
          onRefresh={handleRefresh}
          onClearData={relationships.length > 0 ? handleDropTable : undefined}
          loading={loading}
        />
      )}

      <TopParentsTable topParents={stats.topParents} />

      <RecentRelationshipsTable
        relationships={relationships}
        total={total}
        loading={relationshipsLoading}
      />

      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from the parent_child_requests
              table. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
