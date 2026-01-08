import { useState, useMemo } from 'react';
import type { RequestTag } from '@repo/reports/frontend';

export function useRequestTagsFilters(tags: RequestTag[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterCategorizacion, setFilterCategorizacion] = useState<string>('all');

  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        tag.requestId.toLowerCase().includes(searchLower) ||
        tag.technician.toLowerCase().includes(searchLower) ||
        tag.modulo.toLowerCase().includes(searchLower);
      const matchesModule =
        filterModule === 'all' || tag.modulo === filterModule;
      const matchesCat =
        filterCategorizacion === 'all' ||
        tag.categorizacion === filterCategorizacion;
      return matchesSearch && matchesModule && matchesCat;
    });
  }, [tags, searchTerm, filterModule, filterCategorizacion]);

  const uniqueModules = useMemo(
    () => [...new Set(tags.map((t) => t.modulo))].sort(),
    [tags]
  );

  const uniqueCategorizaciones = useMemo(
    () => [...new Set(tags.map((t) => t.categorizacion))].sort(),
    [tags]
  );

  return {
    searchTerm,
    setSearchTerm,
    filterModule,
    setFilterModule,
    filterCategorizacion,
    setFilterCategorizacion,
    filteredTags,
    uniqueModules,
    uniqueCategorizaciones,
  };
}
