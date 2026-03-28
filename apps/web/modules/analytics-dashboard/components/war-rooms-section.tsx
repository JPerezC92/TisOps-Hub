'use client';

import { useState, useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import { formatDateTimeRange, getStatusColor } from '@/modules/analytics-dashboard/utils';
import type { WarRoom, Application } from '@/modules/analytics-dashboard/types';

interface WarRoomsSectionProps {
  selectedApp: string;
  selectedMonth: string;
  isMonthlyMode: boolean;
  applications: Application[];
}

function formatNotes(notes: string) {
  if (!notes) return null;
  const parts = notes.split(/(Problem|Cause|Resolution)/g);
  return parts.map((part, i) =>
    part === 'Problem' || part === 'Cause' || part === 'Resolution'
      ? <strong key={i}>{part}</strong>
      : part,
  );
}

export function WarRoomsSection({
  selectedApp,
  selectedMonth,
  isMonthlyMode,
  applications,
}: WarRoomsSectionProps) {
  const [data, setData] = useState<WarRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    const fetchWarRooms = async () => {
      setLoading(true);
      const result = await analyticsDashboardService.getWarRooms(selectedApp, selectedMonth);
      setData(result);
      setLoading(false);
    };
    fetchWarRooms();
  }, [selectedApp, selectedMonth]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.requestId.toString().includes(searchTerm),
      ),
    [data, searchTerm],
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedApp, selectedMonth]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  const monthLabel = DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy');

  return (
    <>
      {/* Search and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Input
          type="text"
          placeholder="Search by summary or request ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${filteredData.length} records`}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
        <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            War Rooms Data
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {paginatedData.length} of {filteredData.length} records
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Filters: {appLabel} | {monthLabel} |{' '}
            <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>
              {isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}
            </span>
            <span className="mx-2">|</span>
            Source: <code className="px-1 py-0.5 rounded bg-muted/50">war_rooms</code>
          </p>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No war rooms data found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                  <TableHead className="text-xs font-semibold text-foreground/80">#</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80">Application</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80">Assistants</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80 min-w-[200px]">Date/Time Range</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80">Duration</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80">Request ID</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80 min-w-[300px]">Summary</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80 min-w-[200px]">Notes</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground/80">RCA Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row.requestId}
                    className="border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5 transition-colors group"
                  >
                    <TableCell className="text-xs text-foreground/80">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">
                      {row.app ? (
                        <Badge
                          variant="outline"
                          className="bg-jpc-vibrant-purple-500/10 text-jpc-vibrant-purple-500 border-jpc-vibrant-purple-500/30"
                        >
                          {row.app.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{row.application}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">
                      {row.participants}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">
                      {formatDateTimeRange(row.date, row.startTime, row.endTime)}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">
                      {row.durationMinutes} min
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.requestIdLink ? (
                        <a
                          href={row.requestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-jpc-vibrant-cyan-500 hover:text-jpc-vibrant-cyan-400 underline decoration-jpc-vibrant-cyan-500/30 hover:decoration-jpc-vibrant-cyan-400 transition-colors"
                        >
                          {row.requestId}
                        </a>
                      ) : (
                        <span className="text-foreground/80">{row.requestId}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80 max-w-[300px]">
                      <div className="truncate" title={row.summary}>
                        {row.summary}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(row.status)}`}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80 max-w-[200px]">
                      <div className="whitespace-pre-line" title={row.notes}>
                        {formatNotes(row.notes)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.urlRca && row.urlRca !== 'N/A' && row.urlRca.trim() !== '' ? (
                        <a
                          href={row.urlRca}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-jpc-vibrant-purple-500 hover:text-jpc-vibrant-purple-400 underline decoration-jpc-vibrant-purple-500/30 hover:decoration-jpc-vibrant-purple-400 transition-colors"
                        >
                          {row.rcaStatus}
                        </a>
                      ) : (
                        <span className="text-foreground/80">{row.rcaStatus}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && paginatedData.length > 0 && (
          <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/5 to-jpc-vibrant-purple-500/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="px-3 text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
