/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'books.google.**',
            },
            {
                protocol: 'http',
                hostname: 'books.google.**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'static01.nyt.com',
            },
            {
                protocol: 'https',
                hostname: 'covers.openlibrary.org',
            },
            {
                protocol: 'https',
                hostname: 'ygppwadmpgupkmoegrix.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'logo.clearbit.com',
            },
            {
                protocol: 'https',
                hostname: 'itbook.store',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            },
            {
                protocol: 'https',
                hostname: 'static-assets-web.flixcart.com',
            },
            {
                protocol: 'https',
                hostname: 'www.abebooks.com',
            },
            {
                protocol: 'https',
                hostname: 'www.thriftbooks.com',
            },
            {
                protocol: 'https',
                hostname: 'www.google.com',
            },
            {
                protocol: 'https',
                hostname: 'flagcdn.com',
            },
        ],
    },
};

export default nextConfig;
