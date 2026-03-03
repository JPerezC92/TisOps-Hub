import { RequestIdGrid } from './request-id-grid';
import type { RequestIdItem } from './request-id-grid';

interface MissingIdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedRequestId: string;
  requestIds: RequestIdItem[];
  loading: boolean;
}

export function MissingIdsModal({ isOpen, onClose, linkedRequestId, requestIds, loading }: MissingIdsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-jpc-vibrant-orange-500/50 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-orange-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card/80 border-b border-jpc-vibrant-orange-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-orange-300">Missing Request IDs</h3>
            <p className="text-sm text-orange-300/70 mt-1">
              Linked Request: <span className="text-orange-300 font-semibold">{linkedRequestId}</span>
            </p>
            <p className="text-xs text-orange-300/60 mt-1">
              IDs in parent_child_requests but missing from request_tags
            </p>
          </div>
          <button onClick={onClose} className="text-orange-300/50 hover:text-orange-300 text-2xl leading-none transition-colors" title="Close">×</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-orange-500 mb-4"></div>
              <p className="text-orange-300/70">Loading Missing IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-semibold text-orange-300 mb-2">No Missing IDs</p>
              <p className="text-orange-300/70">All parent_child_requests are present in request_tags</p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-orange-300/70">
                  Found <span className="text-orange-300 font-bold">{requestIds.length}</span> Missing Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <RequestIdGrid items={requestIds} color="orange" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
