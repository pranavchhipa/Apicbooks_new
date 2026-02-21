
// Revised Logic to Test
function extractSeriesInfo(title, subtitle) {
    const text = `${title} ${subtitle || ''}`.trim();
    console.log(`\nAnalyzing: "${text}"`);

    // Pattern 0: Check for parenthetical series at the END first
    // e.g. "Harry Potter ... (Harry Potter, Book 1)"
    const endParenMatch = text.match(/\(([^)]+)\)$/);
    if (endParenMatch) {
        const content = endParenMatch[1];
        // Try to parse "Series, Book X" or "Series #X" inside the parens

        // Sub-Pattern 0a: "Series, Book 1" inside parens
        const commaMatch = content.match(/(.+),\s+Book\s+(\d+(\.\d+)?)/i);
        if (commaMatch) {
            return { seriesName: commaMatch[1].trim(), seriesOrder: parseFloat(commaMatch[2]), pattern: '0a (Paren-Comma)' };
        }

        // Sub-Pattern 0b: "Series #1" inside parens
        const hashMatch = content.match(/(.+)\s+#(\d+(\.\d+)?)/);
        if (hashMatch) {
            return { seriesName: hashMatch[1].trim(), seriesOrder: parseFloat(hashMatch[2]), pattern: '0b (Paren-Hash)' };
        }

        // Sub-Pattern 0c: "Series Book 1" inside parens
        const spaceMatch = content.match(/(.+)\s+Book\s+(\d+(\.\d+)?)/i);
        if (spaceMatch) {
            return { seriesName: spaceMatch[1].trim(), seriesOrder: parseFloat(spaceMatch[2]), pattern: '0c (Paren-Space)' };
        }
    }

    // Original Patterns (Fallbacks)

    // Pattern 1: "(Series Name #1)" - global check if not at end
    const parentheticalMatch = text.match(/\(([^)]+)\s+#(\d+(\.\d+)?)\)/);
    if (parentheticalMatch) {
        return { seriesName: parentheticalMatch[1].trim(), seriesOrder: parseFloat(parentheticalMatch[2]), pattern: 1 };
    }

    // Pattern 2: "Book 1 of Series Name"
    const bookOfMatch = text.match(/Book\s+(\d+(\.\d+)?)\s+of\s+(.+)/i);
    if (bookOfMatch) {
        return { seriesName: bookOfMatch[3].trim(), seriesOrder: parseFloat(bookOfMatch[1]), pattern: 2 };
    }

    // Pattern 3: "Series Name, Book 1" (Risky greedy match)
    // We should make sure we don't match the whole title if it's long.
    // Try to anchor or be less greedy? 
    // If we have "Title (Series, Book 1)", this pattern matches "Title (Series" as name!
    // So we should simpler patterns only if they are clearly structured.

    // Pattern 4: "Series Name Book 1"
    const spaceBookMatch = text.match(/(.+)\s+Book\s+(\d+(\.\d+)?)$/i);
    if (spaceBookMatch) {
        return { seriesName: spaceBookMatch[1].trim(), seriesOrder: parseFloat(spaceBookMatch[2]), pattern: 4 };
    }

    if (subtitle && subtitle.toLowerCase().includes('vol.')) {
        const volMatch = subtitle.match(/Vol\.\s+(\d+(\.\d+)?)/i);
        if (volMatch) {
            return { seriesName: title.trim(), seriesOrder: parseFloat(volMatch[1]), pattern: 5 };
        }
    }

    return { seriesName: null, seriesOrder: null, pattern: null };
}

async function run() {
    // 1. HP Test
    const hpTitle = "Harry Potter and the Sorcerer's Stone (Harry Potter, Book 1)";
    console.log('--- HP Test ---');
    console.log(extractSeriesInfo(hpTitle, ''));

    // 2. The Shining
    // Try a few variations that might occur
    console.log('--- The Shining Simulated ---');
    console.log(extractSeriesInfo("The Shining", ""));
    console.log(extractSeriesInfo("The Shining (The Shining #1)", ""));

    // 3. Look for real data
    console.log('\n--- Fetching Real Shining Data ---');
    try {
        const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=intitle:The+Shining+inauthor:Stephen+King&maxResults=1');
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            console.log('Title:', book.title);
            console.log('Subtitle:', book.subtitle);
            console.log('Categories:', book.categories);
            console.log('Result:', extractSeriesInfo(book.title, book.subtitle));
        }
    } catch (e) { console.error('Fetch error:', e.message); }
    // 4. Open Library Test for The Shining
    console.log('\n--- Open Library Test ---');
    try {
        const isbn = '9780307743657'; // The Shining anchor
        const olRes = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        const olData = await olRes.json();
        if (olData && olData.works && olData.works.length > 0) {
            const workKey = olData.works[0].key;
            console.log('Work Key:', workKey);
            const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
            const workData = await workRes.json();
            console.log('Work Title:', workData.title);
            // Check for series in work data? 
            // Often it's not standardized but let's see.
            // Sometimes it's in 'series' field if lucky.
            console.log('Series Field:', workData.series);
        }
    } catch (e) { console.error('OL Error:', e.message); }
}

run();
