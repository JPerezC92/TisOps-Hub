import { Button } from "@/components/ui/button"

export function UploadSection() {
  return (
    <div className="mb-12 rounded-2xl border border-jpc-vibrant-cyan-500/30 bg-gradient-to-br from-jpc-vibrant-cyan-500/10 via-card to-jpc-vibrant-purple-500/5 p-8 backdrop-blur-sm shadow-xl shadow-jpc-vibrant-cyan-500/10 hover:border-jpc-vibrant-cyan-500/50 hover:shadow-xl hover:shadow-jpc-vibrant-cyan-500/20 transition-all duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Upload Error Categorization Report</h2>
        <p className="mt-2 text-sm text-muted-foreground/90">
          Upload an Excel file (REPORT PARA ETIQUETAR) to parse and categorize error reports
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-4 rounded-xl border border-jpc-vibrant-cyan-500/30 bg-gradient-to-r from-jpc-vibrant-cyan-500/15 to-jpc-vibrant-cyan-500/5 p-4 hover:bg-jpc-vibrant-cyan-500/20 transition-all duration-300 group">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40 group-hover:bg-jpc-vibrant-cyan-500/40 transition-colors">
            <span className="text-sm font-bold text-jpc-vibrant-cyan-400">✓</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-jpc-vibrant-cyan-400">Current Data Source</p>
            <p className="text-xs text-jpc-vibrant-cyan-400/60 mt-1">Data uploaded - 25 records</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-jpc-vibrant-cyan-500/25 px-3 py-1.5 text-xs font-medium text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/40 flex-shrink-0">
            REPORT_PARA_ETIQUETAR.xlsx
          </span>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-amber-600/5 p-4 hover:bg-amber-500/20 transition-all duration-300 group">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/30 border border-amber-500/40 group-hover:bg-amber-500/40 transition-colors">
            <span className="text-sm font-bold text-jpc-vibrant-orange-400">!</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-jpc-vibrant-orange-400">UPSERT Mode</p>
            <p className="text-xs text-jpc-vibrant-orange-400/60 mt-1">Existing records will be updated, new ones will be created</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <label className="block text-sm font-semibold text-foreground">Select Excel File</label>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 bg-muted/40 hover:bg-muted/60 border-jpc-vibrant-cyan-500/20 hover:border-jpc-vibrant-cyan-500/40 transition-all duration-300"
          >
            📁 Browse
          </Button>
          <div className="flex-1 flex items-center rounded-lg border-2 border-dashed border-jpc-vibrant-cyan-500/20 bg-jpc-vibrant-cyan-500/5 px-4 py-4 hover:border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300">
            <p className="text-sm text-jpc-vibrant-cyan-400/60">No file selected</p>
          </div>
        </div>
      </div>

      <Button className="w-full bg-gradient-to-r from-jpc-vibrant-cyan-500 to-jpc-vibrant-cyan-500 hover:from-cyan-600 hover:to-jpc-vibrant-cyan-500 text-white gap-2 h-12 font-semibold shadow-lg shadow-jpc-vibrant-cyan-500/40 hover:shadow-jpc-vibrant-cyan-500/60 transition-all duration-300 hover:scale-105 active:scale-95">
        📤 Upload and Parse →
      </Button>
    </div>
  )
}
