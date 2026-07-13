const MediaResultCard = ({ data }) => {
  if (!data) return null;

  const { title, creator, date, genre, rating, type, poster, artwork, cover, overview, platforms } = data;

  const imageUrl = poster || artwork || cover;

  return (
    <div className="border border-bg-tertiary bg-bg-secondary rounded-sm p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full md:w-48 h-64 md:h-72 object-cover rounded-sm"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-text-primary mb-2">{title}</h2>
          <p className="text-sm text-text-secondary mb-4">Type: {type}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-1">Creator</h3>
              <p className="text-text-primary">{creator}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-1">Release Date</h3>
              <p className="text-text-primary">{date || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-1">Genre</h3>
              <p className="text-text-primary">{genre}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-1">Rating</h3>
              <p className="text-text-primary">{rating}</p>
            </div>
            {platforms && (
              <div className="sm:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-1">Platforms</h3>
                <p className="text-text-primary">{platforms}</p>
              </div>
            )}
          </div>

          {overview && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-2">Overview</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{overview}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaResultCard;