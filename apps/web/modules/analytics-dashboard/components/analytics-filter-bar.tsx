'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getDefaultDateRange } from '@/modules/analytics-dashboard/utils';
import type { Application } from '@/modules/analytics-dashboard/types';

interface AnalyticsFilterBarProps {
  selectedApp: string;
  selectedMonth: string;
  startDate: string;
  endDate: string;
  isMonthlyMode: boolean;
  lastDayOfMonth: string;
  selectedYear: number;
  selectedMonthNum: number;
  applications: Application[];
  onFiltersChange: (app: string, month: string, startDate?: string, endDate?: string) => void;
  onMonthlyModeChange: (value: boolean) => void;
}

export function AnalyticsFilterBar({
  selectedApp,
  selectedMonth,
  startDate,
  endDate,
  isMonthlyMode,
  lastDayOfMonth,
  selectedYear,
  selectedMonthNum,
  applications,
  onFiltersChange,
  onMonthlyModeChange,
}: AnalyticsFilterBarProps) {
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 mb-6 rounded-2xl border border-jpc-vibrant-purple-500/20 bg-card/95 backdrop-blur-sm p-6 shadow-lg">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Application Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Application</label>
            <Select
              value={selectedApp}
              onValueChange={(value) => onFiltersChange(value, selectedMonth)}
            >
              <SelectTrigger className="w-full border-jpc-vibrant-purple-500/20 bg-background">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {applications.map((app) => (
                  <SelectItem key={app.code} value={app.code}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Month</label>
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-jpc-vibrant-purple-500/20 bg-background hover:bg-background/80"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(year) => {
                        const newMonth = `${year}-${String(selectedMonthNum).padStart(2, '0')}`;
                        onFiltersChange(selectedApp, newMonth);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = DateTime.now().year - 2 + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthStr = String(month).padStart(2, '0');
                        const isSelected = month === selectedMonthNum;
                        return (
                          <Button
                            key={month}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={isSelected ? "bg-jpc-vibrant-purple-500 hover:bg-jpc-vibrant-purple-600" : ""}
                            onClick={() => {
                              const newMonth = `${selectedYear}-${monthStr}`;
                              onFiltersChange(selectedApp, newMonth);
                              setMonthPickerOpen(false);
                            }}
                          >
                            {DateTime.fromObject({ month }).toFormat('MMM')}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range Filter (for Evolution of Incidents) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              {isMonthlyMode ? 'End Date' : 'Date Range'}
            </label>
            {isMonthlyMode ? (
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border-jpc-vibrant-purple-500/20 bg-background cursor-default"
                disabled
              >
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {DateTime.fromISO(lastDayOfMonth).toFormat('MMM d, yyyy')}
              </Button>
            ) : (
              <Popover open={dateRangePickerOpen} onOpenChange={setDateRangePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-jpc-vibrant-purple-500/20 bg-background hover:bg-background/80"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {DateTime.fromISO(startDate).toFormat('MMM d')} - {DateTime.fromISO(endDate).toFormat('MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          onFiltersChange(selectedApp, selectedMonth, e.target.value, endDate);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          onFiltersChange(selectedApp, selectedMonth, startDate, e.target.value);
                        }}
                        className="w-full"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const defaultRange = getDefaultDateRange();
                        onFiltersChange(selectedApp, selectedMonth, defaultRange.startDate, defaultRange.endDate);
                        setDateRangePickerOpen(false);
                      }}
                    >
                      Reset to Default (Last Fri - Last Thu)
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Report Mode Toggle */}
        <div className="flex items-center gap-3 lg:ml-auto">
          <span className={`text-sm font-medium ${!isMonthlyMode ? 'text-jpc-vibrant-cyan-400' : 'text-muted-foreground'}`}>
            Weekly
          </span>
          <Switch
            checked={isMonthlyMode}
            onCheckedChange={onMonthlyModeChange}
            className="data-[state=checked]:bg-jpc-vibrant-purple-500"
          />
          <span className={`text-sm font-medium ${isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-muted-foreground'}`}>
            Monthly
          </span>
        </div>
      </div>
    </div>
  );
}
