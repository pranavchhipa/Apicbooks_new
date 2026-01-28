
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const urlLine = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL'));

    if (urlLine) {
        console.log('Found URL line:', urlLine);
        const value = urlLine.split('=')[1].trim();
        console.log('Value:', value);
        console.log('Character codes:');
        for (let i = 0; i < value.length; i++) {
            process.stdout.write(`${value.charCodeAt(i)} `);
        }
        console.log('\n');
    } else {
        console.log('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    }
} catch (err) {
    console.error('Error reading .env.local:', err);
}
