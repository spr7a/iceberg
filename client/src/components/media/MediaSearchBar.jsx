import { useState } from 'react';

const MediaSearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(type, query.trim());
    }
  };

  const mediaTypes = [
    { value: 'movie', label: 'Movie' },
    { value: 'tv', label: 'TV Show' },
    { value: 'music', label: 'Music' },
    { value: 'game', label: 'Game' },
    { value: 'book', label: 'Book' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="px-4 py-2 border border-bg-tertiary bg-bg text-text-primary rounded-sm focus:outline-none focus:border-text-tertiary transition-colors"
        disabled={loading}
      >
        {mediaTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter title (e.g., Inception, The Beatles, Elden Ring)"
        className="flex-1 px-4 py-2 border border-bg-tertiary bg-bg text-text-primary placeholder:text-text-tertiary rounded-sm focus:outline-none focus:border-text-tertiary transition-colors"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="bg-accent hover:bg-accent-hover disabled:bg-bg-tertiary disabled:text-text-tertiary text-white px-6 py-2 rounded-sm transition-all duration-150 font-medium active:scale-[0.98]"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default MediaSearchBar;