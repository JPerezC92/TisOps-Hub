'use client';

import Link from 'next/link';

export default function ReportsPage() {
  const reportSections = [
    {
      title: '📊 Data Management',
      description: 'Manage and analyze data from various sources',
      links: [
        {
          href: '/request-relationships',
          title: 'Request Relationships',
          description: 'View and manage parent-child request relationships',
          icon: '🔗',
        },
        {
          href: '/rep01-tags',
          title: 'REP01 Tags',
          description: 'Upload and view REP01 tag data',
          icon: '🏷️',
        },
        {
          href: '/error-categorization',
          title: 'Error Categorization',
          description: 'Categorize and analyze errors',
          icon: '🔍',
        },
      ],
    },
    {
      title: '🐛 System Monitoring',
      description: 'Monitor system health and errors',
      links: [
        {
          href: '/error-logs',
          title: 'Error Logs',
          description: 'View all system errors and exceptions',
          icon: '📝',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
      <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-jpc-gold-500">
            📈 Reports & Data Management
          </h1>
          <p className="text-jpc-gold-500/70 mt-2">
            Access all reporting tools and data management features
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {reportSections.map((section, index) => (
            <div key={index}>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-jpc-gold-500">{section.title}</h2>
                <p className="text-jpc-gold-500/70 text-sm">{section.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30 hover:shadow-jpc-400/50 transition-all duration-200 hover:-translate-y-1 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{link.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-jpc-gold-500 mb-2 group-hover:text-jpc-400 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-jpc-gold-500/70">
                          {link.description}
                        </p>
                      </div>
                      <svg 
                        className="h-5 w-5 text-jpc-gold-500/50 group-hover:text-jpc-400 group-hover:translate-x-1 transition-all" 
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
