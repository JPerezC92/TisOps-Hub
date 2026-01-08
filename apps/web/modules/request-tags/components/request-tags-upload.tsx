'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { useUploadRequestTags } from '@/modules/request-tags/hooks/use-upload-request-tags';
import { useRequestTags } from '@/modules/request-tags/hooks/use-request-tags';

export function RequestTagsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  const { data } = useRequestTags();
  const uploadMutation = useUploadRequestTags();

  const tags = data?.tags ?? [];

  useEffect(() => {
    const savedFilename = localStorage.getItem('lastUploadedRequestTagsFile');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadMutation.mutateAsync(file);
      toast.success('Upload successful', {
        description: `Total: ${result.total} | Imported: ${result.imported} | Skipped: ${result.skipped}`,
      });
      setCurrentFilename(file.name);
      localStorage.setItem('lastUploadedRequestTagsFile', file.name);
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <UploadSectionDynamic
      currentFilename={currentFilename}
      recordsCount={tags.length}
      file={file}
      uploading={uploadMutation.isPending}
      onFileChange={handleFileChange}
      onUpload={handleUpload}
      hardcodedFilename="REP01 XD TAG 2025.xlsx"
      title="Upload Request Tags Report"
      description="Upload an Excel file (REP01 XD TAG 2025) to import and manage request tag data"
    />
  );
}
