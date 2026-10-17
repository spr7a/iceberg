const { searchMediaFacts } = require('./serpApiservice');
const { extractText } = require('./groqService');
const { trackQuery, getTrending } = require('./redisService');
const { fetchPrimaryImage } = require('./mediaService');

const DEEP_LORE_PROMPT = (title, mediaType, searchText) => `
**Role & Objective:**
Act as a master media historian and archivist. Your task is to provide a dive into the history, lore, and facts surrounding **"${title}"**, which is a **${mediaType}**.

**Constraints:**
- **Balance Niche with Context:** Prioritize "bottom-of-the-iceberg" facts, Reddit deep-dives, and obscure forum data. However, if you find obvious or widely known general information, keep a few of them to provide good context.
- **Data-Driven:** Give specific names, dates, direct quotes, and concrete details whenever possible.

**Here is the raw search data to mine:**
${searchText.slice(0, 6500)}

Please organize your response using the following detailed categories. If a category lacks data, do your best to summarize general trivia related to it, or combine it with another section.

---

**1. Lore, Worldbuilding & Concept Themes**
- Extract specific canon lore or underlying concepts. 
- Explain backstory details for characters, settings, or narrative events.

**2. Easter Eggs & Hidden Details**
- List visual details, hidden audio cues, or coded messages.
- Explain inside jokes made by the creators.

**3. Cut Content & Development History**
- Name deleted scenes, unreleased content, or abandoned concepts.
- Explain why this content was cut if known.

**4. Real-World Impact & Trivia**
- Detail interesting real-world events, controversies, or cultural shifts.
- Include general popular trivia if deep cuts aren't available.

---

**Formatting Rules:**
- **Zero fluff intros.** Start immediately with the first category.
- Use bolding for names, dates, and specific terms.
- Present the facts as concise bullet points.
`;

const MUSIC_LORE_PROMPT = (title, searchText) => `
You are a "Music Lore Hunter". Unearth the weirdest, most obscure facts from the depths of Reddit, Gearspace, Discogs, and fan wikis for "${title}". 

**SOURCES TO PRIORITIZE:**
1. Reddit threads and Gearspace/production forums
2. Discogs comments and fan wikis
3. Obscure interviews or popular mainstream trivia (use general info if deep cuts are missing)

**SEARCH RESULTS:**
${searchText.slice(0, 7000)}

**OUTPUT STRUCTURE:**

## 🎛️ PRODUCTION & CREATION
*(Include gear models, studio names, recording dates, or general album creation trivia)*

## 📜 STORIES & LORE
*(Include specific incidents, quotes, real-world inspirations, or popular band history)*

## 🧵 FAN THEORIES & RABBIT HOLES
*(Include Reddit thread arguments, fan debates, or widely accepted community theories)*

## 🕵️ EASTER EGGS & HIDDEN DETAILS
*(Include timestamps, hidden messages, sample origins, or visual clues)*

## 🗑️ RARE & CUT CONTENT
*(Include unreleased tracks, demos, rare bootlegs, or alternative versions)*

**FORMATTING RULES:**
- Start DIRECTLY with the first section. NO introduction.
- Bold specific names, dates, numbers, and gear models.
- Use bullet points for each fact.
- It is OKAY to include popular/obvious facts if ultra-niche facts are missing. Just ensure the output is interesting.
`;

const normalizeType = (type) => {
  const typeMap = {
    'tv': 'tv',
    'show': 'tv',
    'music': 'music',
    'song': 'music',
    'album': 'music',
    'game': 'game',
    'games': 'game',
    'book': 'book',
    'books': 'book',
    'movie': 'movie',
  };
  return typeMap[type.toLowerCase()] || null;
};

const generateSimpleDossier = async (type, query) => {
  console.log(`Hunting deep-cuts for: ${query} (${type})`);

  const normalizedType = normalizeType(type);
  if (!normalizedType) {
    return { 
      dossier: `Media type "${type}" not supported. Use movie, music, book, tv, or game.`,
      images: []
    };
  }

  const typeMap = {
    movie: 'Movie',
    music: 'Music Artist / Album',
    book: 'Book / Novel',
    tv: 'TV Show / Series',
    game: 'Video Game',
  };
  const mediaType = typeMap[normalizedType] || normalizedType;

  const isMusic = normalizedType === 'music';
  
  // Broadened search query to capture both niche forums and general trivia
  const loreQuery = isMusic
    ? `"${query}" (site:reddit.com OR site:gearspace.com OR site:discogs.com OR "interview" OR "trivia" OR "lore" OR "production" OR "history")`
    : `"${query}" ${normalizedType} (site:reddit.com OR site:imdb.com OR "interview" OR "behind the scenes" OR "trivia" OR "lore" OR "history")`;

  const { rawText, images } = await searchMediaFacts(loreQuery);

  // Lowered threshold to ensure we don't accidentally reject popular topics
  if (!rawText || rawText.length < 20) {
    return { 
      dossier: `Couldn't find enough data for **"${query}"**. Try searching for a specific album, episode, or adding a year.`,
      images: []
    };
  }

  const primaryImage = await fetchPrimaryImage(normalizedType, query);

  const userPrompt = isMusic
    ? MUSIC_LORE_PROMPT(query, rawText)
    : DEEP_LORE_PROMPT(query, mediaType, rawText);

  const systemInstruction = isMusic
    ? `
You are a Music Lore Expert.
**CRITICAL INSTRUCTIONS:**
1. Prioritize specific technical details and forum data if available.
2. If deep technical lore isn't available, it is perfectly fine to include popular trivia, general history, and obvious facts to build context.
3. Do NOT reject the prompt or complain about missing data. Do your best with what is provided.
4. Absolutely DO NOT start with an introductory sentence. Jump straight into the first section.
`
    : `
You are a Media Lore Expert.
**CRITICAL INSTRUCTIONS:**
1. Prioritize specific niche details and forum data if available.
2. If deep lore isn't available, it is perfectly fine to include popular trivia, general history, and obvious facts to build context.
3. Do NOT reject the prompt or complain about missing data. Do your best with what is provided.
4. Absolutely DO NOT start with an introductory sentence. Jump straight into Category 1.
`;

  const finalDossier = await extractText(systemInstruction, userPrompt);

  // Removed the strict failure trap that rejected general summaries
  if (finalDossier.length < 20) {
    return { 
      dossier: `The search results for **"${query}"** were too limited. Try searching for a specific work to unlock more lore.`,
      images: images,
      primaryImage: primaryImage
    };
  }

  try {
    await trackQuery(query, { title: query, type: normalizedType, preview: finalDossier.substring(0, 200), image: primaryImage });
  } catch (err) {
    console.error('[Redis] Failed to track query:', err.message);
  }

  const allImages = primaryImage ? [primaryImage, ...images] : images;

  return { dossier: finalDossier, images: allImages };
};

const HARDCODED_TRENDING = [
  { topic: 'aphex twin', score: 999, summary: { type: 'music', title: 'Aphex Twin' } },
  { topic: 'boards of canada', score: 998, summary: { type: 'music', title: 'Boards of Canada' } },
];

const getTrendingQueries = async () => {
  try {
    const redisTrending = await getTrending(10);
    const redisTopics = new Set(redisTrending.map((t) => t.topic.toLowerCase().trim()));

    const missingHardcoded = HARDCODED_TRENDING.filter(
      (h) => !redisTopics.has(h.topic.toLowerCase().trim())
    );

    const combined = [...missingHardcoded, ...redisTrending].slice(0, 10);
    return combined;
  } catch (err) {
    console.error('[Redis] Failed to get trending:', err.message);
    return HARDCODED_TRENDING;
  }
};

module.exports = {
  generateSimpleDossier,
  getTrendingQueries,
};
