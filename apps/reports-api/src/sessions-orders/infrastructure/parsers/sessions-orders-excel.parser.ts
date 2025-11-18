import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';

export interface ParsedSessionsOrdersData {
  mainRecords: InsertSessionsOrder[];
  releaseRecords: InsertSessionsOrdersRelease[];
}

@Injectable()
export class SessionsOrdersExcelParser {
  parse(buffer: Buffer): ParsedSessionsOrdersData {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

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
      dia: Number(row['dia']) || 0,
      incidentes: Number(row['incidentes']) || 0,
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
