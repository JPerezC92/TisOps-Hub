"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const mockData = [
  {
    id: 1,
    category: "Error de Alcance",
    technician: "Joel Veneciado Bejar Espinoza - Tomarit",
    requestId: "154079",
    createdTime: "31/10/2025 09:35",
    module: "Unete Actualizar Información",
    subject: "COJC16UNETE:ACTUALIZAR INFORMACIO...",
    problemId: "No asignado",
    linkedRequest: "No asignado",
    additional: "No registrado",
    color: "cyan",
  },
  {
    id: 2,
    category: "Error de Alcance",
    technician: "Joel Veneciado Bejar Espinoza - Tomarit",
    requestId: "154985",
    createdTime: "31/10/2025 09:47",
    module: "Unete Generación de Código",
    subject: "COJC16UNETE:GENERACION DE CODIGO",
    problemId: "No asignado",
    linkedRequest: "91644",
    additional: "No asignado",
    color: "cyan",
  },
  {
    id: 3,
    category: "Error de Codificación (Bug)",
    technician: "Joel Veneciado Bejar Espinoza - Tomarit",
    requestId: "155234",
    createdTime: "01/11/2025 09:35",
    module: "Unete Actualizar Información",
    subject: "COJC16UNETE:ACTUALIZAR INFORMACIO...",
    problemId: "No asignado",
    linkedRequest: "No asignado",
    additional: "No registrado",
    color: "purple",
  },
  {
    id: 4,
    category: "Error de Codificación (Bug)",
    technician: "Kevin Flooster Ortillo Yoharin",
    requestId: "115340",
    createdTime: "03/11/2025 10:42",
    module: "Unete Generación de Código",
    subject: "CUC1:UNETE:GESTIONAPOSTULANTELEC...",
    problemId: "No asignado",
    linkedRequest: "102587",
    additional: "No asignado",
    color: "purple",
  },
  {
    id: 5,
    category: "Error de datos (Data Source)",
    technician: "Adrian Orijado Alejandro Sanchez - TEMAMR",
    requestId: "115442",
    createdTime: "03/11/2025 13:14",
    module: "SBJ Carrito Sugerido",
    subject: "PEC1648:CARRITO SUGERIDO:Productos no...",
    problemId: "No asignado",
    linkedRequest: "91315",
    additional: "Pendiente",
    color: "emerald",
  },
]

const categoryColors = {
  cyan: "bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30",
  purple: "bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30",
  orange: "bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30",
  emerald: "bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40 hover:bg-jpc-vibrant-emerald-500/30",
}

export function DataTable() {
  return (
    <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
      <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
        <h3 className="text-sm font-bold text-foreground">
          Error Classification Records
          <span className="ml-3 text-xs font-normal text-muted-foreground/70">
            Showing {mockData.length} total records
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                #
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                CATEGORY
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                TECHNICIAN
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                REQUEST ID
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                CREATED TIME
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                MODULE
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                SUBJECT
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                PROBLEM ID
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                LINKED REQUEST
              </TableHead>
              <TableHead className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider">
                ADDITIONAL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row, idx) => (
              <TableRow
                key={row.id}
                className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <TableCell className="py-4 text-xs text-jpc-vibrant-cyan-400/70 font-medium">{row.id}</TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className={`${categoryColors[row.color as keyof typeof categoryColors]} border font-medium transition-all duration-300`}
                  >
                    {row.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-xs text-foreground/80 group-hover:text-jpc-vibrant-cyan-400 transition-colors">
                  {row.technician}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs bg-jpc-vibrant-cyan-500/15 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/30 group-hover:bg-jpc-vibrant-cyan-500/25 transition-all duration-300"
                  >
                    {row.requestId}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-xs text-muted-foreground/80">{row.createdTime}</TableCell>
                <TableCell className="py-4 text-xs text-foreground/80 group-hover:text-jpc-vibrant-cyan-400 transition-colors">
                  {row.module}
                </TableCell>
                <TableCell className="py-4 text-xs text-muted-foreground/75 truncate max-w-xs">{row.subject}</TableCell>
                <TableCell className="py-4 text-xs text-muted-foreground/80">{row.problemId}</TableCell>
                <TableCell className="py-4">
                  {row.linkedRequest !== "No asignado" ? (
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/40 group-hover:bg-jpc-vibrant-cyan-500/30 transition-all duration-300"
                    >
                      {row.linkedRequest}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/80">{row.linkedRequest}</span>
                  )}
                </TableCell>
                <TableCell className="py-4 text-xs text-muted-foreground/80">{row.additional}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
