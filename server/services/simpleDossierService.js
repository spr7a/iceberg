const { searchMediaFacts } = require('./serpApiservice');
const { extractText } = require('./groqService');
const { trackQuery, getTrending } = require('./redisService');
const { fetchPrimaryImage } = require('./mediaService');

const DEEP_LORE_PROMPT = (title, mediaType, searchText) => `
**Role & Objective:**
Act as a master media historian, archivist, and deep-lore expert. Your task is to provide an exhaustive, highly niche dive into the history, lore, and obscure facts surrounding **"${title}"**, which is a **${mediaType}**.

**Strict Constraints (CRITICAL):**
- **No Basic Trivia:** Skip widely known facts. I want "bottom-of-the-iceberg" facts only.
- **No Vague Summaries or Meta-Commentary:** Do NOT write filler sentences like *"This movie sparked significant online discussion with its themes"* or *"There are many shocking behind-the-scenes secrets."* 
- **Hard Data Only:** I do not want to be told *that* there are facts; I want the actual facts. Give me specific names, exact dates, technical mechanics, direct quotes, and concrete details. Skip the introduction and get straight to the data.

**Here is the raw search data to mine:**
${searchText.slice(0, 6500)}

Please organize your response using the following detailed categories. **If you have absolutely ZERO concrete data for a category, skip it entirely. Do not write "No information found".**

---

**1. Deep Lore, Worldbuilding & Concept Themes**
- Extract specific canon lore (or underlying lyrical concepts) hidden deep within tie-in materials (name the specific liner notes, comic books, companion novels, or obscure interviews).
- Explain the exact backstory of a specific minor character, background event, or specific setting/song detail.
- Identify specific paradoxes, timeline anomalies, or narrative inconsistencies.

**2. Niche Easter Eggs & Hidden Details**
- List the exact timestamps or locations of blink-and-you-miss-it visual details, hidden audio cues, backmasking (reversed audio), or coded messages.
- Explain the specific inside jokes made by the developers, directors, or band members.

**3. Cut Content, Unused Concepts & Lost Media**
- Name the specific deleted scenes, cut levels, unreleased tracks, obscure B-sides, or abandoned storylines.
- Explain exactly why this content was cut, and note if it has been leaked, bootlegged, or officially released since.

**4. Bizarre Real-World Impact & Legal Oddities**
- Detail any specific strange real-world events, controversies, or unexpected cultural shifts this media directly caused.
- Name the parties involved in bizarre lawsuits, sample clearance disputes, copyright battles, or regional censorship issues.

---

**Formatting Rules:**
- **Zero fluff intros or outros.** Start immediately with the first category.
- Use bolding for names, dates, and specific terms.
- Present the facts as concise, punchy, data-heavy bullet points under each heading.
- If a fact is unconfirmed, clearly state it as a rumor. Otherwise, stick exclusively to verified reality.
`;

const MUSIC_LORE_PROMPT = (title, searchText) => `
You are a "Music Lore Hunter" who specializes in unearthing the weirdest, most obscure facts from the depths of Reddit, Gearspace, Discogs forums, and fan wikis.

Using ONLY the search results below, compile a dossier of the most fascinating hidden details, easter eggs, and deep-cut facts for the artist/song/album "${title}".

**PRIMARY SOURCES TO PRIORITIZE (in order):**
1. Reddit threads (r/electronicmusic, r/synthesizers, r/LetsTalkMusic, r/audioengineering, r/fanpages, r/indieheads, r/hiphopheads, r/music)
2. Gearspace and other production forums
3. Discogs comments and release notes
4. Fan wikis (e.g., "The Pink Floyd Wiki", "The Beatles Wiki")
5. Obscure interviews (NME, Pitchfork, Rolling Stone, Fader)
6. YouTube comments on deep-cut remixes or demos

**HARD DATA REQUIREMENTS (NO FLUFF):**

🚫 **FORBIDDEN (ZERO TOLERANCE):**
- "X is widely considered to be..."
- "Many fans believe..."
- "X has inspired a generation of..."
- "His influence can be heard in..."
- "X is known for his experimental approach..."
- "Discussions on Reddit often feature..."
- "There are many interesting facts about..."

✅ **REQUIRED (CONCRETE FACTS ONLY):**
- Specific gear used (exact model numbers, modifications, DIY builds)
- Exact dates, locations, and studio names
- Direct quotes from band members, producers, engineers
- Specific numbers (copies sold, BPM, recording time, budget)
- Specific Reddit thread titles and exact user claims
- Specific alternative versions, demos, or B-sides with exact track names
- Specific legal battles, sample clearance issues, or controversies
- Specific visual details in music videos, album art, or live performances
- Specific technical details (recording techniques, mixing quirks, mastering oddities)

**SEARCH RESULTS:**
${searchText.slice(0, 7000)}

**OUTPUT STRUCTURE (Skip any section with insufficient concrete data):**

## 🎛️ PRODUCTION GEEKERY
*(Only include: specific gear models, exact studio names, recording dates, technical innovations, DIY techniques)*

> Example: "Used a modified EMS Synthi AKS with a banana jack mod (specificed in r/synthesizers thread by user 'synthesist_99')."

## 📜 THE UNTOLD STORIES
*(Only include: specific incidents, exact quotes, real-world inspirations, behind-the-scenes drama)*

> Example: "In a 1997 NME interview, James stated: 'I recorded the entire album on a £5 portable cassette recorder from Argos.'"

## 🧵 REDDIT RABBIT HOLES & FORUM WARS
*(Only include: specific Reddit thread titles, exact user arguments, controversies, unresolved debates)*

> Example: "r/synthesizers thread 'Is the Casio FZ-1 underrated?' has 247 comments arguing about its use on the RDJ Album."

## 🕵️ HIDDEN EASTER EGGS
*(Only include: specific timestamps, hidden messages, visual clues, backmasking, coded references)*

> Example: "Track 3 contains backmasked vocals at 2:34 saying 'I love you' when reversed."

## 🗑️ CUT CONTENT & LOST MEDIA
*(Only include: unreleased tracks with exact names, scrapped album concepts, demo versions, rare bootlegs)*

> Example: "The unreleased track 'Unreleased 1994' was leaked on Reddit in 2019 and is available on YouTube."

## ⚖️ LEGAL BATTLES & CONTROVERSIES
*(Only include: specific lawsuits, sample clearance disputes, censorship cases, regional bans)*

> Example: "In 1998, James was sued by his neighbor for playing a 5Hz frequency that allegedly caused migraines. Case was dismissed."

**FORMATTING RULES:**
- Start DIRECTLY with the first section. NO introduction, NO summary, NO "here are the facts".
- Bold specific names, dates, numbers, and gear models.
- Use bullet points for each concrete fact.
- If you can't find at least 3 concrete facts in a section, SKIP IT entirely.
- If you have fewer than 5 total concrete facts across all sections, output exactly: "❌ No deep-cut lore found. Try searching for a specific album or track instead."

**REMEMBER:** Every single bullet point MUST contain a specific name, date, number, location, or exact quote. Zero exceptions.
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
  const loreQuery = isMusic
    ? `"${query}" (site:reddit.com OR site:gearspace.com OR site:discogs.com OR site:soundonsound.com OR site:musicradar.com OR "interview" OR "behind the scenes" OR "trivia" OR "lore" OR "lost media" OR "recording" OR "production" OR "gear" OR "synth" OR "sample")`
    : `"${query}" ${normalizedType} (site:reddit.com OR site:gearspace.com OR site:discogs.com OR site:imdb.com OR "interview" OR "behind the scenes" OR "trivia" OR "lore" OR "deleted scene" OR "lost media")`;

  const { rawText, images } = await searchMediaFacts(loreQuery);

  if (!rawText || rawText.length < 100) {
    return { 
      dossier: `Couldn't find enough deep-cut data for **"${query}"**. Try searching for a specific album, specific episode, or adding a year (e.g., "Aphex Twin 1995").`,
      images: []
    };
  }

  const primaryImage = await fetchPrimaryImage(normalizedType, query);

  const userPrompt = isMusic
    ? MUSIC_LORE_PROMPT(query, rawText)
    : DEEP_LORE_PROMPT(query, mediaType, rawText);

  const systemInstruction = isMusic
    ? `
You are a "Music Lore Gatekeeper" with zero tolerance for generic fluff.

**CRITICAL INSTRUCTIONS:**
1. You MUST follow the user's prompt EXACTLY.
2. If the provided search text does NOT contain a specific name, date, location, or technical detail for a category, **SKIP THAT CATEGORY**. Do not write "No information found".
3. Absolutely DO NOT start with an introductory sentence. Jump straight into the first section.
4. Every bullet point MUST contain a concrete fact (e.g., "Used a modified EMS Synthi AKS" vs. "Used interesting gear").
5. If you have fewer than 5 total concrete facts across all sections, output exactly: "❌ No deep-cut lore found. Try searching for a specific album or track instead."
`
    : `
You are a "Lore Gatekeeper" with zero tolerance for generic fluff.

**CRITICAL INSTRUCTIONS:**
1. You MUST follow the user's prompt EXACTLY.
2. If the provided search text does NOT contain a specific name, date, location, or technical detail for a category, **SKIP THAT CATEGORY**. Do not write "No information found".
3. Absolutely DO NOT start with an introductory sentence. Jump straight into **Category 1**.
4. Every bullet point MUST contain a concrete fact (e.g., "Robin Williams was considered for Jack Torrance in 1998" vs. "Many actors were considered").
`;

  const finalDossier = await extractText(systemInstruction, userPrompt);

  if (finalDossier.length < 50 || finalDossier.includes("sparked significant online discussion")) {
    return { 
      dossier: `The search results for **"${query}"** only contained surface-level summaries. Try searching for a specific work (e.g., "Selected Ambient Works" instead of "Aphex Twin") to unlock the deep lore.`,
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