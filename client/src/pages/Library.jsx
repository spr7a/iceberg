import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import SavedMediaCard from '../components/library/SavedMediaCard';
import Spinner from '../components/common/Spinner';

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLibrary();
  }, [user, navigate]);

  const fetchLibrary = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/api/library/media');
      setLibrary(data.library);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (dossierId) => {
    setLibrary((prev) => prev.filter((item) => item._id !== dossierId));
  };

  const getMediaTypeEmoji = (type) => {
    const emojis = {
      movie: '🎬',
      tv: '📺',
      music: '🎵',
      game: '🎮',
      book: '📚',
    };
    return emojis[type] || '🎬';
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
        My Library
      </h1>
      <p className="text-text-secondary mb-8">
        {library.length > 0 
          ? `${library.length} saved dossier${library.length !== 1 ? 's' : ''}` 
          : 'Your media vault'}
      </p>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 border border-error/40 bg-error/10 text-error rounded-sm text-sm">
          {error}
        </div>
      )}

      {!loading && library.length === 0 && (
        <div className="text-center py-16 border border-bg-tertiary bg-bg-secondary rounded-sm">
          <div className="text-4xl mb-4 opacity-30">
            🎬 📺 🎵 📚 🎮
          </div>
          <h3 className="text-lg font-medium text-text-secondary mb-2">
            Your media vault is empty.
          </h3>
          <p className="text-text-tertiary mb-4 max-w-md mx-auto">
            Unearth the deep cuts. Search for any movie, show, album, game, or book, and save the lore to your personal archive.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-sm transition-all duration-150 text-sm font-medium active:scale-[0.98]"
          >
            🎬 Start Exploring
          </button>
        </div>
      )}

      {!loading && library.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {library.map((item) => (
            <SavedMediaCard 
              key={item._id} 
              item={item} 
              onDelete={handleDelete}
              emoji={getMediaTypeEmoji(item.mediaType)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;