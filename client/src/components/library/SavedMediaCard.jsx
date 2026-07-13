import { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const SavedMediaCard = ({ item, onDelete, emoji }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this saved dossier?')) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/api/library/media/${item._id}`);
      onDelete(item._id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const dateStr = new Date(item.savedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border border-bg-tertiary bg-bg-secondary rounded-sm overflow-hidden transition-shadow duration-200 hover:shadow-sm">
      <div
        className="px-5 py-4 cursor-pointer hover:bg-bg-tertiary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
              <p className="text-sm text-text-tertiary">
                {item.mediaType}
                {item.releaseYear && ` • ${item.releaseYear}`}
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-text-tertiary transform transition-transform flex-shrink-0 ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-4 border-t border-bg-tertiary">
          {/* Image */}
          {item.imageUrl && !imageError && (
            <div className="mt-3">
              <img
                src={item.imageUrl}
                alt={item.title}
                onError={() => setImageError(true)}
                className="w-full max-w-xs h-auto rounded-sm"
              />
            </div>
          )}
          
          {/* Dossier Text */}
          {item.dossierText && (
            <div className="mt-3 text-sm text-text-secondary leading-relaxed">
              <p>{item.dossierText}</p>
            </div>
          )}
          
          <div className="mt-3 text-xs text-text-tertiary">
            Saved on {dateStr}
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="mt-4 text-sm font-medium text-error hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete dossier'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedMediaCard;