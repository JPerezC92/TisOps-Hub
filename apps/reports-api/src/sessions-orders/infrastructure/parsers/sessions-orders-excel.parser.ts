import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { DateTime } from 'luxon';
import type { InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';

// Convert date value to Unix timestamp (handles Date object, serial number, or string)
const parseDateToTimestamp = (value: any): number => {
  // If it's already a Date object (from cellDates: true)
  if (value instanceof Date) {
    return value.getTime();
  }

  // If it's a number (Excel serial number)
  if (typeof value === 'number') {
    // Excel serial to Unix timestamp
    return (value - 25569) * 86400 * 1000;
  }

  // If it's a string like "27/11/2025" or "27-Nov-2025"
  if (typeof value === 'string') {
    // Try dd/MM/yyyy format first
    let date = DateTime.fromFormat(value, 'dd/MM/yyyy');
    if (date.isValid) return date.toMillis();

    // Try d-MMM-yyyy format with Spanish locale
    date = DateTime.fromFormat(value, 'd-MMM-yyyy', { locale: 'es' });
    if (date.isValid) return date.toMillis();
  }

  console.warn(`Could not parse date value: ${value} (type: ${typeof value})`);
  return 0;
};

export interface ParsedSessionsOrdersData {
  mainRecords: InsertSessionsOrder[];
  releaseRecords: InsertSessionsOrdersRelease[];
}

@Injectable()
export class SessionsOrdersExcelParser {
  parse(buffer: Buffer): ParsedSessionsOrdersData {
    // Parse Excel file with cellDates option to get proper Date objects
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    // Process Hoja1 (main data)
    const hoja1 = workbook.Sheets['Hoja1'];
    if (!hoja1) {
      throw new Error('Main sheet (Hoja1) not found');
    }
    const hoja1Data = XLSX.utils.sheet_to_json(hoja1);

    if (hoja1Data.length === 0) {
      throw new Error('Main sheet (Hoja1) is empty');
    }

    // Process Hoja3 (releases)
    const hoja3 = workbook.Sheets['Hoja3'];
    const hoja3Data = hoja3 ? XLSX.utils.sheet_to_json(hoja3) : [];

    // Map Hoja1 rows to database format
    const mainRecords: InsertSessionsOrder[] = hoja1Data.map((row: any) => ({
      ano: Number(row['año']) || 0,
      mes: Number(row['mes']) || 0,
      peak: Number(row['peak']) || 0,
      dia: parseDateToTimestamp(row['dia']),
      incidentes: Number(row['incidentes']) || 0,
      sessions: Number(row['session']) || 0,
      placedOrders: Number(row['placed orders']) || 0,
      billedOrders: Number(row['billed orders']) || 0,
    }));

    // Map Hoja3 rows to database format
    const releaseRecords: InsertSessionsOrdersRelease[] = hoja3Data.map((row: any) => {
      // Collect all ticket data from __EMPTY columns
      const ticketsArray = [];
      if (row['# TICKETS']) ticketsArray.push(row['# TICKETS']);

      // Collect from __EMPTY columns
      for (let i = 0; i < 12; i++) {
        const key = i === 0 ? '__EMPTY' : `__EMPTY_${i}`;
        if (row[key] && row[key] !== '') {
          ticketsArray.push(row[key]);
        }
      }

      return {
        semana: String(row['SEMANA'] || ''),
        aplicacion: String(row['APLICACIÓN'] || ''),
        fecha: Number(row['FECHA']) || 0,
        release: String(row['RELEASE'] || ''),
        ticketsCount: Number(row['tickets ']) || 0,
        ticketsData: JSON.stringify(ticketsArray),
      };
    });

    return { mainRecords, releaseRecords };
  }
}
