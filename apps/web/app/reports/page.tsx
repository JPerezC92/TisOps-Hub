'use client';

import Link from 'next/link';

export default function ReportsPage() {
  const reportSections = [
    {
      title: 'Data Management',
      description: 'Manage and analyze data from various sources',
      icon: '📊',
      links: [
        {
          href: '/request-relationships',
          title: 'Request Relationships',
          description: 'View and manage parent-child request relationships',
          icon: '🔗',
          color: 'cyan',
        },
        {
          href: '/request-tags',
          title: 'Request Tags',
          description: 'Upload and view request tag data (REP01)',
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
      ],
    },
    {
      title: 'Incident Reports',
      description: 'Track and manage incident data',
      icon: '🚨',
      links: [
        {
          href: '/war-rooms',
          title: 'War Rooms',
          description: 'View and manage war room incident records',
          icon: '⚔️',
          color: 'orange',
        },
        {
          href: '/monthly-report',
          title: 'Monthly Report',
          description: 'Monthly incident reports and tracking',
          icon: '📅',
          color: 'cyan',
        },
        {
          href: '/weekly-corrective',
          title: 'Weekly Corrective',
          description: 'Weekly corrective action reports',
          icon: '🔧',
          color: 'emerald',
        },
        {
          href: '/sessions-orders',
          title: 'Sessions & Orders',
          description: 'View incidents, sessions, and orders data',
          icon: '📦',
          color: 'purple',
        },
        {
          href: '/problems',
          title: 'Problems',
          description: 'Track and manage reported problems',
          icon: '🔴',
          color: 'orange',
        },
      ],
    },
    {
      title: 'System Monitoring',
      description: 'Monitor system health and errors',
      icon: '🐛',
      links: [
        {
          href: '/error-logs',
          title: 'Error Logs',
          description: 'View all system errors and exceptions',
          icon: '📝',
          color: 'orange',
        },
      ],
    },
    {
      title: 'Configuration',
      description: 'Manage application settings and mappings',
      icon: '⚙️',
      links: [
        {
          href: '/application-registry',
          title: 'Application Registry',
          description: 'Manage application names and pattern matching rules',
          icon: '📱',
          color: 'cyan',
        },
        {
          href: '/request-status-registry',
          title: 'Request Status Registry',
          description: 'Manage status mappings from raw values to display statuses',
          icon: '🏷️',
          color: 'purple',
        },
        {
          href: '/categorization-registry',
          title: 'Categorization Registry',
          description: 'Manage categorization mappings from source values to display values',
          icon: '🗂️',
          color: 'emerald',
        },
        {
          href: '/module-registry',
          title: 'Module Registry',
          description: 'Manage module mappings with application indicators (CD, FFVV, SB, UNETE)',
          icon: '📦',
          color: 'orange',
        },
      ],
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Reports & Data Management</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Access all reporting tools and data management features
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {reportSections.map((section, index) => (
            <div key={index}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.title}
                </h2>
                <p className="text-muted-foreground/80 mt-1">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`bg-card border rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group ${getColorClasses(link.color)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{link.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-jpc-vibrant-cyan-400 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-muted-foreground/80">
                          {link.description}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-muted-foreground/50 group-hover:text-jpc-vibrant-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
