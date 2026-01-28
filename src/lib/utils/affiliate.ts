/**
 * Appends affiliate tags to buy links for Amazon and eBay.
 * 
 * @param url The original URL from Google Books API
 * @returns The URL with affiliate parameters appended if applicable
 */
export function addAffiliateTags(url: string | undefined): string {
    if (!url) return '#';

    try {
        const urlObj = new URL(url);

        // Amazon (Example format, adjust based on actual affiliate program)
        if (urlObj.hostname.includes('amazon')) {
            urlObj.searchParams.set('tag', 'apicbooks-20'); // Replace with actual ID
        }

        // eBay
        if (urlObj.hostname.includes('ebay')) {
            urlObj.searchParams.set('mkcid', '1');
            urlObj.searchParams.set('mkrid', '711-53200-19255-0');
            urlObj.searchParams.set('siteid', '0');
            urlObj.searchParams.set('campid', '5338xxxxxx'); // Replace with actual ID
            urlObj.searchParams.set('toolid', '10001');
            urlObj.searchParams.set('mkevt', '1');
        }

        return urlObj.toString();
    } catch (e) {
        // If URL parsing fails, return original
        return url;
    }
}
