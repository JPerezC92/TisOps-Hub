'use client';

import { Suspense } from 'react';
import { useAnalyticsFilters } from '@/modules/analytics-dashboard/hooks/use-analytics-filters';
import { AnalyticsFilterBar } from '@/modules/analytics-dashboard/components/analytics-filter-bar';
import { WarRoomsSection } from '@/modules/analytics-dashboard/components/war-rooms-section';
import { CriticalIncidentsSection } from '@/modules/analytics-dashboard/components/critical-incidents-section';
import { StabilityIndicatorsSection } from '@/modules/analytics-dashboard/components/stability-indicators-section';
import { ParentTicketSection } from '@/modules/analytics-dashboard/components/parent-ticket-section';
import { IncidentsByDaySection } from '@/modules/analytics-dashboard/components/incidents-by-day-section';
import { EvolutionOfIncidentsSection } from '@/modules/analytics-dashboard/components/evolution-of-incidents-section';
import { IncidentOverviewSection } from '@/modules/analytics-dashboard/components/incident-overview-section';
import { L3SummarySection } from '@/modules/analytics-dashboard/components/l3-summary-section';
import { L3RequestsByStatusSection } from '@/modules/analytics-dashboard/components/l3-requests-by-status-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';


function AnalyticsDashboardContent() {

  // Shared filters (app, month, date range, report mode)
  const {
    filters,
    applications,
    isMonthlyMode,
    setIsMonthlyMode,
    selectedYear,
    selectedMonthNum,
    updateFilters,
  } = useAnalyticsFilters();
  const { selectedApp, selectedMonth, startDate, endDate, lastDayOfMonth } = filters;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            War Rooms analytics and incident tracking
          </p>
        </div>

        {/* Sticky Filter Bar */}
        <AnalyticsFilterBar
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          startDate={startDate}
          endDate={endDate}
          isMonthlyMode={isMonthlyMode}
          lastDayOfMonth={lastDayOfMonth}
          selectedYear={selectedYear}
          selectedMonthNum={selectedMonthNum}
          applications={applications}
          onFiltersChange={updateFilters}
          onMonthlyModeChange={setIsMonthlyMode}
        />

        {/* War Rooms Section */}
        <WarRoomsSection
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
        />

        {/* Critical Incidents Section */}
        <CriticalIncidentsSection
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
        />

        {/* Operational Stability Indicators Section */}
        <StabilityIndicatorsSection
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
        />

        {/* Distribution of Missing Scope by Parent Ticket Section */}
        <ParentTicketSection
          title="Distribution of Missing Scope by Parent Ticket"
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
          fetchData={analyticsDashboardService.getMissingScopeByParent}
          colorScheme="amber"
        />

        {/* Distribution of Bugs by Parent Ticket Section */}
        <ParentTicketSection
          title="Distribution of Bugs by Parent Ticket"
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
          fetchData={analyticsDashboardService.getBugsByParent}
          colorScheme="red"
        />

        {/* Incidents by Day Section */}
        <IncidentsByDaySection
          selectedApp={selectedApp}
          endDay={isMonthlyMode ? parseInt((lastDayOfMonth ?? '').split('-')[2] ?? '0', 10) : parseInt((endDate ?? '').split('-')[2] ?? '0', 10)}
          applications={applications}
        />

        {/* Evolution of Incidents Section */}
        <EvolutionOfIncidentsSection
          selectedApp={selectedApp}
          selectedMonth={selectedMonth}
          startDate={startDate}
          endDate={endDate}
          isMonthlyMode={isMonthlyMode}
          lastDayOfMonth={lastDayOfMonth}
          applications={applications}
        />

        {/* Incident Overview by Category Section */}
        <IncidentOverviewSection
          selectedApp={selectedApp}
          startDate={startDate}
          endDate={endDate}
          isMonthlyMode={isMonthlyMode}
          lastDayOfMonth={lastDayOfMonth}
          applications={applications}
        />

        {/* L3 Summary Section */}
        <L3SummarySection
          selectedApp={selectedApp}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
        />

        {/* L3 Requests by Status Section */}
        <L3RequestsByStatusSection
          selectedApp={selectedApp}
          isMonthlyMode={isMonthlyMode}
          applications={applications}
        />

      </main>
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
