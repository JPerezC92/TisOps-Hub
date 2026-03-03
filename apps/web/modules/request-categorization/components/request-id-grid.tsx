export interface RequestIdItem {
  requestId: string;
  requestIdLink?: string;
}

interface RequestIdGridProps {
  items: RequestIdItem[];
  color: 'cyan' | 'purple' | 'orange';
}

const colorMap = {
  cyan: {
    card: 'bg-jpc-vibrant-cyan-500/10 border-jpc-vibrant-cyan-500/30 hover:bg-jpc-vibrant-cyan-500/20',
    link: 'text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-400/80',
    text: 'text-foreground/80',
  },
  purple: {
    card: 'bg-jpc-vibrant-purple-500/10 border-jpc-vibrant-purple-500/30 hover:bg-jpc-vibrant-purple-500/20',
    link: 'text-purple-300 hover:text-purple-300/80',
    text: 'text-purple-300',
  },
  orange: {
    card: 'bg-jpc-vibrant-orange-500/10 border-jpc-vibrant-orange-500/30 hover:bg-jpc-vibrant-orange-500/20',
    link: 'text-orange-300 hover:text-orange-300/80',
    text: 'text-orange-300',
  },
};

export function RequestIdGrid({ items, color }: RequestIdGridProps) {
  const c = colorMap[color];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),max-content))] gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={`${c.card} border rounded-lg px-3 py-2 transition-all flex flex-wrap`}
        >
          {item.requestIdLink ? (
            <a
              href={item.requestIdLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${c.link} font-mono text-sm transition-colors no-underline flex items-center gap-1`}
            >
              {item.requestId}
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span className={`${c.text} font-mono text-sm`}>
              {item.requestId}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
