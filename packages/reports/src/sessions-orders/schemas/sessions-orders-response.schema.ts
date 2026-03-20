import { z } from 'zod';

export const sessOrdSessionsOrderSchema = z.object({
  id: z.number(),
  ano: z.number(),
  mes: z.number(),
  peak: z.number(),
  dia: z.number(),
  incidentes: z.number(),
  sessions: z.number(),
  placedOrders: z.number(),
  billedOrders: z.number(),
});

export const sessOrdReleaseSchema = z.object({
  id: z.number(),
  semana: z.string(),
  aplicacion: z.string(),
  fecha: z.number(),
  release: z.string(),
  ticketsCount: z.number(),
  ticketsData: z.string(),
});

export const sessOrdGetAllResponseSchema = z.object({
  data: z.array(sessOrdSessionsOrderSchema),
  releases: z.array(sessOrdReleaseSchema),
  total: z.number(),
  totalReleases: z.number(),
});

export const sessOrdUploadResultSchema = z.object({
  message: z.string(),
  importedMain: z.number(),
  importedReleases: z.number(),
  totalMain: z.number(),
  totalReleases: z.number(),
});

export const sessOrdDeleteResultSchema = z.object({
  message: z.string(),
  deletedMain: z.number(),
  deletedReleases: z.number(),
});

export const sessOrdLast30DaysRowSchema = z.object({
  day: z.string(),
  date: z.string(),
  incidents: z.number(),
  sessions: z.number(),
  placedOrders: z.number(),
});

export const sessOrdLast30DaysResponseSchema = z.object({
  data: z.array(sessOrdLast30DaysRowSchema),
});

export const sessOrdIncidentsVsOrdersRowSchema = z.object({
  month: z.string(),
  monthNumber: z.number(),
  incidents: z.number(),
  placedOrders: z.number(),
});

export const sessOrdIncidentsVsOrdersResponseSchema = z.object({
  data: z.array(sessOrdIncidentsVsOrdersRowSchema),
});

export type SessOrdGetAllResponse = z.infer<typeof sessOrdGetAllResponseSchema>;
export type SessOrdUploadResult = z.infer<typeof sessOrdUploadResultSchema>;
export type SessOrdDeleteResult = z.infer<typeof sessOrdDeleteResultSchema>;
export type SessOrdLast30DaysResponse = z.infer<typeof sessOrdLast30DaysResponseSchema>;
export type SessOrdIncidentsVsOrdersResponse = z.infer<typeof sessOrdIncidentsVsOrdersResponseSchema>;
