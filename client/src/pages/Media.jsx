import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import MediaSearchBar from '../components/media/MediaSearchBar';
import Spinner from '../components/common/Spinner';
import ReactMarkdown from 'react-markdown';

const Media = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [currentType, setCurrentType] = useState('movie');
  const [currentQuery, setCurrentQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSearch = async (type, query) => {
    setLoading(true);
    setError('');
    setResult(null);
    setImages([]);
    setCurrentType(type);
    setCurrentQuery(query);
    setSaved(false);
    try {
      const { data } = await axiosClient.post('/api/media/dossier-simple', { type, query });
      setResult(data.dossier);
      setImages(data.images || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Please log in to save to your library');
      return;
    }
    setSaving(true);
    try {
      const { data } = await axiosClient.post('/api/library/media', {
        mediaType: currentType,
        title: currentQuery,
        imageUrl: images[0] || '',
        dossierText: result,
      });
      setSaved(data.saved);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const { data } = await axiosClient.get('/api/media/trending');
      setTrending(data.trending || []);
    } catch (err) {
      console.error('Failed to fetch trending:', err);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-3">
          Ice Berg
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Search for movies, TV shows, music, games, or books to get the deepest lore, weirdest trivia, and hidden stories.
        </p>
      </div>

      <div className="mb-8">
        <MediaSearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="mb-6 p-4 border border-error/40 bg-error/10 text-error rounded-sm text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-text-tertiary">Generating dossier...</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-8">
          {images.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                Related Images
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Related to search`}
                    className="w-full h-32 object-cover rounded-sm border border-bg-tertiary hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface border border-border rounded-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-serif font-bold text-text-primary">
                {currentQuery}
              </h2>
              {user && (
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-150 ${
                    saved 
                      ? 'bg-success/20 text-success cursor-default' 
                      : 'bg-accent hover:bg-accent-hover text-white active:scale-[0.98]'
                  }`}
                >
                  {saved ? '✅ Saved' : saving ? 'Saving...' : '📥 Save to Library'}
                </button>
              )}
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary prose-ul:my-4 prose-ol:my-4 prose-headings:font-serif prose-p:font-sans">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-serif font-bold text-text-primary mb-6 mt-8">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-serif font-bold text-text-primary mb-4 mt-6">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="text-text-secondary font-sans mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  li: ({ children }) => (
                    <li className="text-text-secondary font-sans mb-2">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-text-primary font-semibold">
                      {children}
                    </strong>
                  ),
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-text-primary">Trending Media Searches</h2>
            <span className="text-xs font-medium text-accent border border-accent/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              This Week
            </span>
          </div>

          {trendingLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : trending.length === 0 ? (
            <div className="border border-bg-tertiary bg-bg-secondary rounded-sm p-8 text-center">
              <p className="text-text-tertiary text-sm">
                No trending searches yet. Be the first to search for a media title!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trending.map((item, i) => {
                const type = item.summary?.type || 'movie';
                const imageUrl = item.summary?.image || '';
                const typeEmojis = { movie: '🎬', tv: '📺', music: '🎵', game: '🎮', book: '📚' };
                const typeEmoji = typeEmojis[type] || '🎬';
                const preview = item.summary?.preview || '';
                return (
                  <button
                    key={item.topic}
                    onClick={() => handleSearch(type, item.topic)}
                    className="group text-left bg-bg-secondary border border-bg-tertiary rounded-sm overflow-hidden transition-all duration-150 hover:border-accent/60 hover:shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    {imageUrl ? (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={item.topic}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="h-20 bg-bg-tertiary/30 flex items-center justify-center text-3xl opacity-40">
                        {typeEmoji}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="shrink-0 text-xs">{typeEmoji}</span>
                            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                              {type}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
                            {item.topic}
                          </span>
                        </div>
                        {i === 0 && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/40 px-1.5 py-0.5 rounded-full">
                            Hot
                          </span>
                        )}
                        {i > 0 && i <= 2 && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-500 border border-amber-500/40 px-1.5 py-0.5 rounded-full">
                            Trending
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs text-text-tertiary">
                          {typeof item.score === 'number' ? `${item.score} search${item.score !== 1 ? 'es' : ''}` : ''}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Media;