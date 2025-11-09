export function InfoBanners() {
  return (
    <div className="mb-12 space-y-4">
      <div className="flex gap-4 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-500/15 to-blue-600/5 p-6 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group backdrop-blur-sm">
        <div className="text-2xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">ℹ️</div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-blue-100 group-hover:text-blue-50 transition-colors duration-300">
            Column Types Legend
          </h4>
          <p className="mt-2 text-xs text-blue-100/70 leading-relaxed">
            <span className="font-semibold text-blue-100">Stored Columns:</span> Data saved directly in the database.
            Fast to retrieve, always available.
          </p>
          <p className="mt-2 text-xs text-blue-100/70 leading-relaxed">
            <span className="font-semibold text-blue-100">Computed Columns:</span> Data calculated on-demand from
            related tables (REPO Tags). Always fresh, may be slower.
          </p>
        </div>
      </div>

      <div className="flex gap-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/5 p-6 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group backdrop-blur-sm">
        <div className="text-2xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">⚠️</div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-amber-100 group-hover:text-amber-50 transition-colors duration-300">
            About the 'Missing ID' Column
          </h4>
          <p className="mt-2 text-xs text-amber-100/70 leading-relaxed">
            The "Missing ID" column shows Request ID that exists in the{" "}
            <code className="bg-amber-500/30 px-2 py-1 rounded text-xs font-mono text-amber-100">
              parent_child_requests
            </code>{" "}
            table but are missing from the{" "}
            <code className="bg-amber-500/30 px-2 py-1 rounded text-xs font-mono text-amber-100">repo_tags</code> table.
          </p>
        </div>
      </div>
    </div>
  )
}
