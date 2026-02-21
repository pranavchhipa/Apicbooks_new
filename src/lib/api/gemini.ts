import type { Book } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GeminiRecommendation {
    title: string;
    author: string;
    reason: string;
    isbn?: string;
}

interface MoodAnalysis {
    recommendations: GeminiRecommendation[];
    explanation: string;
}

/**
 * Get book recommendations based on a mood/feeling description
 */
/**
 * Get book recommendations based on a mood/feeling description
 */
const moodCache = new Map<string, { data: GeminiRecommendation[], timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

export async function getMoodRecommendations(mood: string): Promise<GeminiRecommendation[]> {
    const normalizedMood = mood.toLowerCase().trim();

    // Check Cache
    const cached = moodCache.get(normalizedMood);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log(`[GeminiAPI] Returning cached recommendations for mood: "${normalizedMood}"`);
        return cached.data;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    // If no API key, return mock data
    if (!apiKey) {
        console.log('No OpenRouter API key found, using mock recommendations');
        return getMockRecommendations(mood).recommendations;
    }

    console.log('Using real OpenRouter API (Claude/Gemini) for mood:', mood);

    const prompt = `You are Anika, an expert book recommender. The user is asking for books based on a plot, mood, or trope: "${mood}".
    Your task is to identify 10 real, published books that perfectly match this request.
    
    CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON array of objects. Do not include markdown formatting, conversational text, or explanation properties outside the array. 
    
    Use this exact schema:
    [
      { "title": "Exact Book Title", "author": "Firstname Lastname", "reason": "Specific reason why it fits" },
      ...
    ]
    
    Selection Rules:
    - Recommend exactly 10 books.
    - Prioritize popular, high-quality books that fit specific tropes perfectly.
    - CONTENT GUIDELINE: Default to General Audience/YA suitable books (no explicit content).
    - EXCEPTION: If user EXPLICITLY asks for "spicy", "steamy", or "adult", you may recommend mature fiction, but strictly prioritize high-quality, widely published novels.
    - ABSOLUTELY NO CHILDREN'S PICTURE BOOKS. Focus on Chapter Books, YA, and Adult Fiction.
    - If "alien romance" or "shifter", ensure every book fits that specific niche.
    
    Return ONLY valid JSON array.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://w.apicbooks.com',
                'X-Title': 'ApicBooks'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            console.error('OpenRouter API error:', response.status);
            return getMockRecommendations(mood).recommendations;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        console.log('OpenRouter raw response length:', text.length);

        // Parse JSON from response
        let jsonText = text;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonText = codeBlockMatch[1];

        // Use a more generic array matcher
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);

        if (!jsonMatch) {
            console.error('No JSON Array found in OpenRouter response');
            return getMockRecommendations(mood).recommendations;
        }

        const parsed = JSON.parse(jsonMatch[0]) as GeminiRecommendation[];
        console.log('Parsed', parsed.length, 'recommendations');

        // Save to Cache
        if (parsed.length > 0) {
            moodCache.set(normalizedMood, { data: parsed, timestamp: Date.now() });
        }

        return parsed;
    } catch (error) {
        console.error('Failed to get OpenRouter recommendations:', error);
        return getMockRecommendations(mood).recommendations;
    }
}


/**
 * Get "Read Alike" recommendations based on a specific book
 */
export async function getReadAlikes(title: string, author: string): Promise<MoodAnalysis | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return null;
    }

    const prompt = `You are an expert librarian. The user loves query: "${title}" by "${author}".
    
    Recommend 6 books that are "Read Alikes" for this specific book.
    Focus on:
    - Similar writing style
    - Similar themes or tropes
    - Similar emotional "vibe"
    
    Format response as JSON:
    {
      "recommendations": [
        {"title": "Title", "author": "Author", "reason": "Why it's similar (e.g. 'If you liked the witty banter in X...')"}
      ],
      "explanation": "Brief context on why these match the seed book."
    }
    Return ONLY valid JSON.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://w.apicbooks.com',
                'X-Title': 'ApicBooks'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        let jsonText = text;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonText = codeBlockMatch[1];

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');

        return JSON.parse(jsonMatch[0]) as MoodAnalysis;

    } catch (error) {
        console.error('getReadAlikes error:', error);
        return null;
    }
}

/**
 * Get recommendations based on a user's "Taste Profile" (multiple liked books)
 */
export async function getTasteBasedRecommendations(likedBooks: { title: string, author: string }[], genres: string[]): Promise<MoodAnalysis | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) return null;

    const booksList = likedBooks.map(b => `"${b.title}" by ${b.author}`).join(', ');
    const genreList = genres.join(', ');

    const prompt = `You are an expert librarian. The user has a specific taste profile.
    
    User's Highly Rated Books: ${booksList}
    User's Favorite Genres: ${genreList}

    Analyze the common themes, writing styles, and plots in these books.
    Recommend 6 books that fit this specific taste profile.
    
    Rules:
    - Do NOT recommend books already listed above.
    - Provide a unique reason connecting the recommendation to the user's taste (e.g., "Since you liked the complex politics in X...").
    - Focus on hidden gems or highly acclaimed books in similar niches.

    Format response as JSON:
    {
      "recommendations": [
        {"title": "Title", "author": "Author", "reason": "Specific connection to user's taste"}
      ],
      "explanation": "Brief analysis of their taste and why these fit."
    }
    Return ONLY valid JSON.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://w.apicbooks.com',
                'X-Title': 'ApicBooks'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        let jsonText = text;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonText = codeBlockMatch[1];

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');

        return JSON.parse(jsonMatch[0]) as MoodAnalysis;

    } catch (error) {
        console.error('getTasteBasedRecommendations error:', error);
        return null;
    }
}

// Export default books for checking in route.ts
export const DEFAULT_BOOKS = [
    "Project Hail Mary",
    "The Thursday Murder Club",
    "Circe",
    "The Seven Husbands of Evelyn Hugo"
];

/**
 * Mock recommendations for when API is not available
 */
export function getMockRecommendations(mood: string): MoodAnalysis {
    const moodLower = mood.toLowerCase();

    // Check for "Alien" specifically (User request)
    if (moodLower.includes('alien') || moodLower.includes('ufo') || moodLower.includes('extraterrestrial') || moodLower.includes('martian')) {
        return {
            recommendations: [
                { title: "Project Hail Mary", author: "Andy Weir", reason: "First contact with an adorable alien ally" },
                { title: "The War of the Worlds", author: "H.G. Wells", reason: "The classic alien invasion story" },
                { title: "Ender's Game", author: "Orson Scott Card", reason: "Humanity's war against an alien hive mind" },
                { title: "The Three-Body Problem", author: "Cixin Liu", reason: "Hard sci-fi about first contact" },
                { title: "Arrival (Stories of Your Life)", author: "Ted Chiang", reason: "Fascinating take on alien language" },
                { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", reason: "Hilarious alien encounters" },
                { title: "Contact", author: "Carl Sagan", reason: "Realistic depiction of first contact" },
                { title: "Dune", author: "Frank Herbert", reason: "Unique alien ecologies and cultures" },
            ],
            explanation: `For your interest in aliens, I've selected the absolute best first-contact and invasion stories.`,
        };
    }

    // Fantasy / Magic
    if (moodLower.includes('fantasy') || moodLower.includes('magic') || moodLower.includes('dragon') || moodLower.includes('wizard') || moodLower.includes('witch')) {
        return {
            recommendations: [
                { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", reason: "The definitive boy-wizard story" },
                { title: "The Hobbit", author: "J.R.R. Tolkien", reason: "A classic magical adventure" },
                { title: "A Game of Thrones", author: "George R.R. Martin", reason: "Epic fantasy with grit and politics" },
                { title: "The Name of the Wind", author: "Patrick Rothfuss", reason: "Beautifully written magical autobiography" },
                { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", reason: "Unique magic system and heist plot" },
                { title: "Circe", author: "Madeline Miller", reason: "Greek mythology aimed at modern readers" },
                { title: "The Night Circus", author: "Erin Morgenstern", reason: "Atmospheric magic and romance" },
                { title: "Fourth Wing", author: "Rebecca Yarros", reason: "Dragons, war, and romance" },
            ],
            explanation: `I've conjured up some fantastic magical worlds for you to explore.`,
        };
    }

    // Determine category based on keywords
    if (moodLower.includes('mystery') || moodLower.includes('thriller') || moodLower.includes('suspense')) {
        return {
            recommendations: [
                { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", reason: "A gripping Scandinavian thriller with complex characters" },
                { title: "Gone Girl", author: "Gillian Flynn", reason: "A twisty psychological thriller that keeps you guessing" },
                { title: "The Silent Patient", author: "Alex Michaelides", reason: "A psychological mystery with a shocking twist" },
                { title: "Big Little Lies", author: "Liane Moriarty", reason: "Mystery woven with suburban drama" },
                { title: "In the Woods", author: "Tana French", reason: "Atmospheric detective fiction with depth" },
                { title: "The Da Vinci Code", author: "Dan Brown", reason: "Fast-paced thriller with puzzles and secrets" },
                { title: "Sharp Objects", author: "Gillian Flynn", reason: "Dark, atmospheric psychological thriller" },
                { title: "The Girl on the Train", author: "Paula Hawkins", reason: "Gripping unreliable narrator mystery" },
            ],
            explanation: `Based on your interest in ${mood}, I've selected thrilling mysteries that will keep you on the edge of your seat.`,
        };
    }

    if (moodLower.includes('romance') || moodLower.includes('love') || moodLower.includes('romantic') || moodLower.includes('sexy')) {
        return {
            recommendations: [
                { title: "Pride and Prejudice", author: "Jane Austen", reason: "The ultimate classic romance" },
                { title: "The Notebook", author: "Nicholas Sparks", reason: "Heartwarming love story across decades" },
                { title: "Outlander", author: "Diana Gabaldon", reason: "Epic romance spanning time and continents" },
                { title: "Beach Read", author: "Emily Henry", reason: "Witty contemporary romance between writers" },
                { title: "The Hating Game", author: "Sally Thorne", reason: "Enemies-to-lovers office romance" },
                { title: "It Ends with Us", author: "Colleen Hoover", reason: "Powerful emotional contemporary romance" },
                { title: "Me Before You", author: "Jojo Moyes", reason: "Beautiful, heart-wrenching love story" },
                { title: "The Time Traveler's Wife", author: "Audrey Niffenegger", reason: "Unique love story transcending time" },
            ],
            explanation: `For your romantic mood, I've selected beautiful love stories ranging from classics to contemporary hits.`,
        };
    }

    if (moodLower.includes('cozy') || moodLower.includes('comfort') || moodLower.includes('warm') || moodLower.includes('feel good')) {
        return {
            recommendations: [
                { title: "A Man Called Ove", author: "Fredrik Backman", reason: "Heartwarming story of an unlikely friendship" },
                { title: "The House in the Cerulean Sea", author: "TJ Klune", reason: "A cozy fantasy about found family" },
                { title: "Anxious People", author: "Fredrik Backman", reason: "Witty and warm-hearted storytelling" },
                { title: "The Midnight Library", author: "Matt Haig", reason: "Uplifting exploration of life's possibilities" },
                { title: "Legends & Lattes", author: "Travis Baldree", reason: "A cozy fantasy about opening a coffee shop" },
                { title: "Eleanor Oliphant Is Completely Fine", author: "Gail Honeyman", reason: "Quirky, heartwarming story of connection" },
                { title: "The Giver of Stars", author: "Jojo Moyes", reason: "Warm story of friendship and adventure" },
                { title: "Major Pettigrew's Last Stand", author: "Helen Simonson", reason: "Charming, gentle English romance" },
            ],
            explanation: `For your ${mood} mood, I've chosen feel-good books that are like a warm hug.`,
        };
    }

    if (moodLower.includes('adventure') || moodLower.includes('action') || moodLower.includes('exciting')) {
        return {
            recommendations: [
                { title: "The Name of the Wind", author: "Patrick Rothfuss", reason: "Epic fantasy adventure with beautiful prose" },
                { title: "Ready Player One", author: "Ernest Cline", reason: "Action-packed virtual reality adventure" },
                { title: "The Martian", author: "Andy Weir", reason: "Thrilling survival story on Mars" },
                { title: "Jurassic Park", author: "Michael Crichton", reason: "Dinosaur adventure that never gets old" },
                { title: "The Hobbit", author: "J.R.R. Tolkien", reason: "The classic adventure tale" },
                { title: "Treasure Island", author: "Robert Louis Stevenson", reason: "Timeless pirate adventure" },
                { title: "The Count of Monte Cristo", author: "Alexandre Dumas", reason: "Epic tale of revenge and adventure" },
                { title: "Life of Pi", author: "Yann Martel", reason: "Extraordinary survival adventure" },
            ],
            explanation: `Your ${mood} mood calls for these pulse-pounding adventures!`,
        };
    }

    if (moodLower.includes('sci-fi') || moodLower.includes('science fiction') || moodLower.includes('space') || moodLower.includes('future')) {
        return {
            recommendations: [
                { title: "Dune", author: "Frank Herbert", reason: "Epic science fiction masterpiece" },
                { title: "The Martian", author: "Andy Weir", reason: "Gripping survival story with real science" },
                { title: "Ender's Game", author: "Orson Scott Card", reason: "Classic sci-fi about a gifted child" },
                { title: "Project Hail Mary", author: "Andy Weir", reason: "Exciting space adventure with heart" },
                { title: "1984", author: "George Orwell", reason: "Dystopian classic that remains relevant" },
                { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", reason: "Hilarious and clever space comedy" },
                { title: "Brave New World", author: "Aldous Huxley", reason: "Thought-provoking dystopian vision" },
                { title: "Foundation", author: "Isaac Asimov", reason: "Grand scale space opera epic" },
            ],
            explanation: `For your science fiction interests, I've selected a mix of classics and modern favorites.`,
        };
    }

    // Default recommendations for any mood
    return {
        recommendations: [
            { title: "Project Hail Mary", author: "Andy Weir", reason: "An uplifting sci-fi adventure with humor and heart" },
            { title: "The Thursday Murder Club", author: "Richard Osman", reason: "Charming mystery with lovable characters" },
            { title: "Circe", author: "Madeline Miller", reason: "Beautiful mythological retelling" },
            { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", reason: "Captivating Hollywood drama" },
            { title: "Klara and the Sun", author: "Kazuo Ishiguro", reason: "Thoughtful and moving literary fiction" },
            { title: "Where the Crawdads Sing", author: "Delia Owens", reason: "Beautiful nature writing meets mystery" },
            { title: "The Alchemist", author: "Paulo Coelho", reason: "Inspiring tale of following your dreams" },
            { title: "Educated", author: "Tara Westover", reason: "Powerful memoir of self-discovery" },
        ],
        explanation: `Based on "${mood}", I've curated a diverse selection of highly acclaimed books across different genres.`,
    };
}

/**
 * Convert Gemini recommendations to book search queries
 */
export function getSearchQueries(recommendations: GeminiRecommendation[]): string[] {
    return recommendations.map(rec => `${rec.title} ${rec.author}`);
}

/**
 * Get individual search query for a recommendation
 */
export function getAlternativeQueries(rec: GeminiRecommendation): string[] {
    return [
        `"${rec.title}" ${rec.author}`,
        rec.title,
        `${rec.author} ${rec.title.split(' ').slice(0, 3).join(' ')}`,
    ];
}
