import Link from "next/link"

export function Header() {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Tasks", href: "/tasks" },
    { label: "File Imports", href: "/imports" },
    { label: "Reports", href: "/reports" },
    { label: "Application Registry", href: "/application-registry" },
    { label: "Analytics Dashboard", href: "/analytics-dashboard" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-jpc-vibrant-cyan-500/20 bg-card/80 backdrop-blur-xl shadow-lg shadow-jpc-vibrant-cyan-500/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-jpc-vibrant-cyan-400 via-jpc-vibrant-cyan-500 to-jpc-vibrant-cyan-500 shadow-lg shadow-jpc-vibrant-cyan-500/40 group-hover:shadow-jpc-vibrant-cyan-500/60 transition-all duration-300">
            <span className="text-sm font-bold text-slate-950">T</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground group-hover:text-jpc-vibrant-cyan-400 transition-colors duration-300">
              TisOps Hub
            </h1>
            <p className="text-xs text-muted-foreground/70">Error Categorization System</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-jpc-vibrant-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-jpc-vibrant-cyan-400 after:to-jpc-vibrant-cyan-500 after:transition-all after:duration-300 hover:after:w-full no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
