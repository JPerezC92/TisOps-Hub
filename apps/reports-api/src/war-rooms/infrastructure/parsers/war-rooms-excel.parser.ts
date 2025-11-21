import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertWarRoom } from '@repo/database';

@Injectable()
export class WarRoomsExcelParser {
  // Helper to convert Excel serial number to JavaScript Date
  private excelSerialToDate(serial: number): Date {
    const daysOffset = 25569; // Days between 1900-01-01 and 1970-01-01
    const millisecondsPerDay = 86400000;
    return new Date((serial - daysOffset) * millisecondsPerDay);
  }

  // Helper to convert Excel date + time serial to Date with time
  private excelDateTimeToDate(dateSerial: number, timeSerial: number): Date {
    const date = this.excelSerialToDate(dateSerial);
    const totalMinutes = Math.round(timeSerial * 1440); // 1440 minutes in a day
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  parse(buffer: Buffer): InsertWarRoom[] {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Map Excel rows to database format
    const records: InsertWarRoom[] = data.map((row: any, index: number) => {
      const requestId = Number(row['Incident ID']) || 0;

      // Extract hyperlink from Incident ID cell (column C)
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and has a header row
      const cellAddress = `C${rowNumber}`;
      const cell = worksheet[cellAddress];
      const requestIdLink = cell?.l?.Target ? String(cell.l.Target) : '';

      const dateSerial = Number(row['Date']) || 0;
      const startTimeSerial = Number(row['Start Time']) || 0;
      const endTimeSerial = Number(row['End Time']) || 0;

      return {
        requestId,
        requestIdLink,
        application: String(row['Application'] || ''),
        date: this.excelSerialToDate(dateSerial),
        summary: String(row['Summary'] || ''),
        initialPriority: String(row['Initial Priority'] || ''),
        startTime: this.excelDateTimeToDate(dateSerial, startTimeSerial),
        durationMinutes: Number(row['Duration (Minutes)']) || 0,
        endTime: this.excelDateTimeToDate(dateSerial, endTimeSerial),
        participants: Number(row['Participants']) || 0,
        status: String(row['Status'] || ''),
        priorityChanged: String(row['Priority Changed'] || ''),
        resolutionTeamChanged: String(row['Resolution team changed'] || ''),
        notes: String(row['Notes'] || ''),
        rcaStatus: String(row['RCA Status'] || ''),
        urlRca: String(row['URL RCA'] || ''),
      };
    });

    return records;
  }
}
