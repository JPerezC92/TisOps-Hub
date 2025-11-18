import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertWarRoom } from '@repo/database';

@Injectable()
export class WarRoomsExcelParser {
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
    const records: InsertWarRoom[] = data.map((row: any) => ({
      incidentId: Number(row['Incident ID']) || 0,
      application: String(row['Application'] || ''),
      date: Number(row['Date']) || 0,
      summary: String(row['Summary'] || ''),
      initialPriority: String(row['Initial Priority'] || ''),
      startTime: Number(row['Start Time']) || 0,
      durationMinutes: Number(row['Duration (Minutes)']) || 0,
      endTime: Number(row['End Time']) || 0,
      participants: Number(row['Participants']) || 0,
      status: String(row['Status'] || ''),
      priorityChanged: String(row['Priority Changed'] || ''),
      resolutionTeamChanged: String(row['Resolution team changed'] || ''),
      notes: String(row['Notes'] || ''),
      rcaStatus: String(row['RCA Status'] || ''),
      urlRca: String(row['URL RCA'] || ''),
    }));

    return records;
  }
}
