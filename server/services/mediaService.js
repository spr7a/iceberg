const axios = require('axios');

// TMDB API for Movies/Shows
const fetchMovieData = async (query) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY is not defined in environment variables');
    }

    // Search for the movie/show
    const searchResponse = await axios.get('https://api.themoviedb.org/3/search/multi', {
      params: {
        api_key: apiKey,
        query: query,
        include_adult: false,
      },
    });

    const results = searchResponse.data.results;
    if (!results || results.length === 0) {
      return null;
    }

    const item = results[0];
    const mediaType = item.media_type;
    const mediaId = item.id;

    // Fetch detailed data
    const detailResponse = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${mediaId}`, {
      params: {
        api_key: apiKey,
        append_to_response: 'credits',
      },
    });

    const data = detailResponse.data;

    return {
      title: data.title || data.name,
      creator: mediaType === 'movie' 
        ? (data.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown')
        : (data.created_by?.map(c => c.name).join(', ') || 'Unknown'),
      date: data.release_date || data.first_air_date || null,
      genre: data.genres?.map(g => g.name).join(', ') || 'Unknown',
      rating: data.vote_average ? `${data.vote_average}/10` : 'N/A',
      type: mediaType === 'movie' ? 'Movie' : 'TV Show',
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      overview: data.overview || null,
    };
  } catch (error) {
    console.error('TMDB error:', error.message);
    throw new Error('Failed to fetch movie data: ' + error.message);
  }
};

// iTunes API for Music
const fetchMusicData = async (query) => {
  try {
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: query,
        media: 'music',
        limit: 1,
      },
    });

    const results = response.data.results;
    if (!results || results.length === 0) {
      return null;
    }

    const item = results[0];

    return {
      title: item.trackName,
      creator: item.artistName,
      date: item.releaseDate ? item.releaseDate.split('T')[0] : null,
      genre: item.primaryGenreName || 'Unknown',
      rating: item.trackRating ? `${item.trackRating}/100` : 'N/A',
      type: 'Music',
      artwork: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '500x500') : null,
      country: item.country || null,
    };
  } catch (error) {
    console.error('iTunes error:', error.message);
    throw new Error('Failed to fetch music data: ' + error.message);
  }
};

// RAWG API for Games
const fetchGameData = async (query) => {
  try {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error('RAWG_API_KEY is not defined in environment variables');
    }

    const response = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: apiKey,
        search: query,
        page_size: 1,
      },
    });

    const results = response.data.results;
    if (!results || results.length === 0) {
      return null;
    }

    const item = results[0];

    return {
      title: item.name,
      creator: item.developers?.map(d => d.name).join(', ') || 'Unknown',
      date: item.released || null,
      genre: item.genres?.map(g => g.name).join(', ') || 'Unknown',
      rating: item.rating ? `${item.rating}/5` : 'N/A',
      type: 'Game',
      poster: item.background_image || null,
      platforms: item.platforms?.map(p => p.platform.name).join(', ') || null,
    };
  } catch (error) {
    console.error('RAWG error:', error.message);
    throw new Error('Failed to fetch game data: ' + error.message);
  }
};

// OpenLibrary API for Books
const fetchBookData = async (query) => {
  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: {
        q: query,
        limit: 1,
      },
    });

    const docs = response.data.docs;
    if (!docs || docs.length === 0) {
      return null;
    }

    const item = docs[0];

    return {
      title: item.title,
      creator: item.author_name ? item.author_name.join(', ') : 'Unknown',
      date: item.first_publish_year ? String(item.first_publish_year) : null,
      genre: item.subject ? item.subject.slice(0, 3).join(', ') : 'Unknown',
      rating: 'N/A', // OpenLibrary doesn't provide ratings
      type: 'Book',
      cover: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : null,
      isbn: item.isbn ? item.isbn[0] : null,
    };
  } catch (error) {
    console.error('OpenLibrary error:', error.message);
    throw new Error('Failed to fetch book data: ' + error.message);
  }
};

// Fetch single primary image for media
const fetchPrimaryImage = async (type, query) => {
  try {
    let data;
    switch (type.toLowerCase()) {
      case 'movie':
      case 'tv':
      case 'show':
        data = await fetchMovieData(query);
        return data?.poster || '';
      case 'music':
      case 'song':
      case 'album':
        data = await fetchMusicData(query);
        return data?.artwork || '';
      case 'game':
      case 'games':
        data = await fetchGameData(query);
        return data?.poster || '';
      case 'book':
      case 'books':
        data = await fetchBookData(query);
        return data?.cover || '';
      default:
        return '';
    }
  } catch (error) {
    console.error('Error fetching primary image:', error.message);
    return '';
  }
};

// Main function to fetch core identity based on media type
const fetchCoreIdentity = async (type, query) => {
  switch (type.toLowerCase()) {
    case 'movie':
    case 'tv':
    case 'show':
      return await fetchMovieData(query);
    case 'music':
    case 'song':
    case 'album':
      return await fetchMusicData(query);
    case 'game':
    case 'games':
      return await fetchGameData(query);
    case 'book':
    case 'books':
      return await fetchBookData(query);
    default:
      throw new Error(`Unsupported media type: ${type}`);
  }
};

module.exports = {
  fetchCoreIdentity,
  fetchMovieData,
  fetchMusicData,
  fetchGameData,
  fetchBookData,
  fetchPrimaryImage,
};
