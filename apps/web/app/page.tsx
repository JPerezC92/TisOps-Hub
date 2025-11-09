'use client';

import Link from 'next/link';

export default function Home() {
  const quickLinks = [
    {
      href: '/imports',
      title: 'File Imports',
      description: 'Upload and manage data imports',
      icon: '📂',
      color: 'cyan',
    },
    {
      href: '/request-tags',
      title: 'Request Tags',
      description: 'View and manage request tag data',
      icon: '🏷️',
      color: 'purple',
    },
    {
      href: '/error-categorization',
      title: 'Error Categorization',
      description: 'Categorize and analyze errors',
      icon: '🔍',
      color: 'emerald',
    },
    {
      href: '/error-logs',
      title: 'Error Logs',
      description: 'Monitor system errors',
      icon: '📝',
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'border-jpc-vibrant-cyan-500/20 hover:border-jpc-vibrant-cyan-500/40 bg-gradient-to-br from-cyan-500/5 to-transparent';
      case 'purple':
        return 'border-jpc-vibrant-purple-500/20 hover:border-jpc-vibrant-purple-500/40 bg-gradient-to-br from-purple-500/5 to-transparent';
      case 'emerald':
        return 'border-jpc-vibrant-emerald-500/20 hover:border-jpc-vibrant-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent';
      case 'orange':
        return 'border-jpc-vibrant-orange-500/20 hover:border-jpc-vibrant-orange-500/40 bg-gradient-to-br from-orange-500/5 to-transparent';
      default:
        return 'border-border/60 hover:border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to TisOps Hub
          </h1>
          <p className="text-xl text-muted-foreground/90 max-w-2xl mx-auto">
            Your centralized platform for operations management, data analysis, and system monitoring
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Data Sources</p>
            <p className="text-4xl font-bold text-jpc-vibrant-cyan-400">4</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Active Modules</p>
            <p className="text-4xl font-bold text-jpc-vibrant-purple-400">6</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Reports Available</p>
            <p className="text-4xl font-bold text-jpc-vibrant-emerald-400">3</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">System Status</p>
            <p className="text-4xl font-bold text-jpc-vibrant-orange-400">✓</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`bg-card border rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group ${getColorClasses(link.color)}`}
              >
                <div className="text-4xl mb-3">{link.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-jpc-vibrant-cyan-400 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground/80">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">All Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/reports"
              className="bg-card border border-border/60 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">📊</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-jpc-vibrant-cyan-400 transition-colors">
                    Reports & Analytics
                  </h3>
                  <p className="text-muted-foreground/80">
                    Access all reporting tools and data management features
                  </p>
                </div>
                <svg
                  className="h-6 w-6 text-muted-foreground/50 group-hover:text-jpc-vibrant-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/tasks"
              className="bg-card border border-border/60 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-jpc-vibrant-purple-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">✅</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-jpc-vibrant-purple-400 transition-colors">
                    Task Manager
                  </h3>
                  <p className="text-muted-foreground/80">
                    Manage your tasks and track your progress
                  </p>
                </div>
                <svg
                  className="h-6 w-6 text-muted-foreground/50 group-hover:text-jpc-vibrant-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground/70">Platform</p>
              <p className="text-foreground font-medium">TisOps Hub v1.0</p>
            </div>
            <div>
              <p className="text-muted-foreground/70">Environment</p>
              <p className="text-foreground font-medium">Development</p>
            </div>
            <div>
              <p className="text-muted-foreground/70">Framework</p>
              <p className="text-foreground font-medium">Next.js with Turborepo</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
