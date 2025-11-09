import { Button } from "@/components/ui/button"

interface Stat {
  label: string
  value: string | number
  color: 'cyan' | 'purple' | 'orange' | 'emerald'
}

interface StatsGridProps {
  stats: Stat[]
  onRefresh?: () => void
  onClearData?: () => void
  loading?: boolean
}

const gradientMap = {
  cyan: "from-jpc-vibrant-cyan-500/20 to-jpc-vibrant-cyan-500/10",
  purple: "from-jpc-vibrant-purple-500/20 to-jpc-vibrant-purple-500/10",
  orange: "from-jpc-vibrant-orange-500/20 to-jpc-vibrant-orange-500/10",
  emerald: "from-jpc-vibrant-emerald-500/20 to-jpc-vibrant-emerald-500/10",
}

export function StatsGrid({ stats, onRefresh, onClearData, loading }: StatsGridProps) {
  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'text-jpc-vibrant-cyan-400';
      case 'purple':
        return 'text-jpc-vibrant-purple-400';
      case 'orange':
        return 'text-jpc-vibrant-orange-400';
      case 'emerald':
        return 'text-jpc-vibrant-emerald-400';
      default:
        return 'text-jpc-vibrant-cyan-400';
    }
  };

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'text-jpc-vibrant-cyan-400/50';
      case 'purple':
        return 'text-jpc-vibrant-purple-400/50';
      case 'orange':
        return 'text-jpc-vibrant-orange-400/50';
      case 'emerald':
        return 'text-jpc-vibrant-emerald-400/50';
      default:
        return 'text-jpc-vibrant-cyan-400/50';
    }
  };

  return (
    <div className="mb-12 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Error Statistics</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2 border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:bg-jpc-vibrant-cyan-500/20 hover:border-jpc-vibrant-cyan-500/50 bg-transparent transition-all duration-300"
          >
            🔄 Refresh Data
          </Button>
          {onClearData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearData}
              disabled={loading}
              className="gap-2 border-red-500/50 text-red-200 hover:text-red-100 hover:bg-red-600/30 hover:border-red-500/70 bg-red-600/20 transition-all duration-300"
              title="Delete all records from the request_categorization table"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border/60 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-4xl font-bold ${getTextColorClass(stat.color)}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
