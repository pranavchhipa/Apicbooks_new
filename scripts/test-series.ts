import { getGoogleBookById, searchGoogleBooks } from '../src/lib/api/google-books';

async function run() {
    console.log('--- Testing Harry Potter (Issue: Incorrect Series Name) ---');
    // Harry Potter and the Sorcerer's Stone
    // Search to find the specific ID usually returned or use a known one
    const hpResults = await searchGoogleBooks('Harry Potter and the Sorcerer\'s Stone', 1);
    if (hpResults.length > 0) {
        const book = hpResults[0];
        console.log(`Title: "${book.title}"`);
        console.log(`Detected Series: "${book.seriesName}"`);
        console.log(`Detected Order: ${book.seriesOrder}`);
        console.log('--- Raw Volume Info (Title) ---');
        console.log(book.title);
    }

    console.log('\n--- Testing The Shining (Issue: Missing Series) ---');
    const shiningResults = await searchGoogleBooks('The Shining Stephen King', 1);
    if (shiningResults.length > 0) {
        const book = shiningResults[0];
        console.log(`Title: "${book.title}"`);
        console.log(`Detected Series: "${book.seriesName}"`);
        console.log(`Detected Order: ${book.seriesOrder}`);
        console.log('--- Raw Data Check ---');
        // We can't see raw raw data easily as it's mapped, but we can see what title/subtitle we got.
        // To see if "Volume 1" etc is hidden in description or implicit.
        console.log('Description Snippet:', book.description?.substring(0, 100));
    }
}

run();
