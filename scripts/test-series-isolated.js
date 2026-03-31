const fetch = require('node-fetch');

// Copy-pasted logic from src/lib/api/google-books.ts
function extractSeriesInfo(title, subtitle) {
    const text = `${title} ${subtitle || ''}`;
    console.log(`Analyzing: "${text}"`);

    // Pattern 1: "(Series Name #1)" or "(Series Name #1.5)"
    const parentheticalMatch = text.match(/\(([^)]+)\s+#(\d+(\.\d+)?)\)/);
    if (parentheticalMatch) {
        return { seriesName: parentheticalMatch[1].trim(), seriesOrder: parseFloat(parentheticalMatch[2]), pattern: 1 };
    }

    // Pattern 2: "Book 1 of Series Name"
    const bookOfMatch = text.match(/Book\s+(\d+(\.\d+)?)\s+of\s+(.+)/i);
    if (bookOfMatch) {
        return { seriesName: bookOfMatch[3].trim(), seriesOrder: parseFloat(bookOfMatch[1]), pattern: 2 };
    }

    // Pattern 3: "Series Name, Book 1"
    const commaBookMatch = text.match(/(.+),\s+Book\s+(\d+(\.\d+)?)/i);
    if (commaBookMatch) {
        return { seriesName: commaBookMatch[1].trim(), seriesOrder: parseFloat(commaBookMatch[2]), pattern: 3 };
    }

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
    // 1. Text Fix for Harry Potter
    const hpTitle = "Harry Potter and the Sorcerer's Stone (Harry Potter, Book 1)";
    console.log('--- HP Test ---');
    console.log(extractSeriesInfo(hpTitle, ''));

    // 2. Fetch Real Data for The Shining
    console.log('\n--- The Shining Fetch ---');
    try {
        const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=intitle:The+Shining+inauthor:Stephen+King&maxResults=1');
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            console.log('Title:', book.title);
            console.log('Subtitle:', book.subtitle);
            console.log('Description Snippet:', book.description ? book.description.substring(0, 100) : 'N/A');
            console.log('Categories:', book.categories);
            console.log('Result:', extractSeriesInfo(book.title, book.subtitle));
        }
    } catch (e) {
        console.error(e);
    }
}

run();
