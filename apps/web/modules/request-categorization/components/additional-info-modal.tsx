import { RequestIdGrid } from './request-id-grid';
import type { RequestIdItem } from './request-id-grid';

interface AdditionalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  additionalInfo: string;
  linkedRequestId: string;
  requestIds: RequestIdItem[];
  loading: boolean;
}

export function AdditionalInfoModal({ isOpen, onClose, additionalInfo, linkedRequestId, requestIds, loading }: AdditionalInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-jpc-vibrant-cyan-500/30 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-cyan-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card/80 border-b border-jpc-vibrant-cyan-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground/80">Request IDs</h3>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Linked Request: <span className="text-jpc-vibrant-cyan-400 font-semibold">{linkedRequestId}</span>
              {' • '}
              Additional Info: <span className="text-jpc-vibrant-cyan-400 font-semibold">{additionalInfo}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground/80 hover:text-jpc-vibrant-cyan-400 text-2xl leading-none transition-colors" title="Close">×</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500 mb-4"></div>
              <p className="text-muted-foreground/80">Loading Request IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-semibold text-foreground/80 mb-2">No Request IDs Found</p>
              <p className="text-muted-foreground/80">This additional info is not assigned to any requests</p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground/80">
                  Found <span className="text-jpc-vibrant-cyan-400 font-bold">{requestIds.length}</span> Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <RequestIdGrid items={requestIds} color="cyan" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
