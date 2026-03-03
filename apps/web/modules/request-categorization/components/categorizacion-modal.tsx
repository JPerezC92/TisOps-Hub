import { RequestIdGrid } from './request-id-grid';
import type { RequestIdItem } from './request-id-grid';

interface CategorizacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedRequestId: string;
  categorizacion: string;
  requestIds: RequestIdItem[];
  loading: boolean;
}

export function CategorizacionModal({ isOpen, onClose, linkedRequestId, categorizacion, requestIds, loading }: CategorizacionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-jpc-vibrant-purple-500/30 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card/80 border-b border-jpc-vibrant-purple-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-purple-300">Request IDs by Tag Categorization</h3>
            <p className="text-sm text-purple-300/70 mt-1">
              Linked Request: <span className="text-purple-300 font-semibold">{linkedRequestId}</span>
              {' • '}
              Categorization: <span className="text-purple-300 font-semibold">{categorizacion}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-purple-300/50 hover:text-purple-300 text-2xl leading-none transition-colors" title="Close">×</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-purple-500 mb-4"></div>
              <p className="text-purple-300/70">Loading Request IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-semibold text-purple-300 mb-2">No Request IDs Found</p>
              <p className="text-purple-300/70">No requests match this combination</p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-purple-300/70">
                  Found <span className="text-purple-300 font-bold">{requestIds.length}</span> Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <RequestIdGrid items={requestIds} color="purple" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
