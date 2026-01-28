
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygppwadmpgupkmoegrix.supabase.co';

console.log(`Testing connection to: ${supabaseUrl}`);

const req = https.get(supabaseUrl, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    console.log('Headers:', res.headers);

    res.on('data', (d) => {
        // just consume data
    });
});

req.on('error', (e) => {
    console.error('Connection error:', e);
});
