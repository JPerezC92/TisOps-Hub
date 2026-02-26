import { useState, useMemo } from 'react';
import type { Problem } from '../services/problems.service';

export function useProblemFilters(problems: Problem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const applications = useMemo(
    () => Array.from(new Set(problems.map((p) => p.aplicativos))).sort(),
    [problems]
  );

  const categories = useMemo(
    () => Array.from(new Set(problems.map((p) => p.serviceCategory))).sort(),
    [problems]
  );

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        problem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.requestId.toString().includes(searchTerm);
      const matchesApplication =
        applicationFilter === 'all' || problem.aplicativos === applicationFilter;
      const matchesCategory =
        categoryFilter === 'all' || problem.serviceCategory === categoryFilter;

      return matchesSearch && matchesApplication && matchesCategory;
    });
  }, [problems, searchTerm, applicationFilter, categoryFilter]);

  return {
    searchTerm,
    setSearchTerm,
    applicationFilter,
    setApplicationFilter,
    categoryFilter,
    setCategoryFilter,
    applications,
    categories,
    filteredProblems,
  };
}
