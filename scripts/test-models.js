
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function testModel(modelId) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log(`Testing ${modelId}...`);
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://localhost:3000',
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: 'user', content: 'Hi' }]
            }),
        });

        if (response.ok) {
            console.log(`SUCCESS: ${modelId}`);
            const data = await response.json();
            console.log(JSON.stringify(data).substring(0, 100));
        } else {
            console.log(`FAILED: ${modelId} - ${response.status} ${response.statusText}`);
            console.log(await response.text());
        }
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
    }
    console.log('---');
}

async function run() {
    // Current best guesses
    await testModel('google/gemini-2.0-flash-lite-preview-02-05:free');
    await testModel('google/gemini-2.0-flash-exp:free');
    await testModel('google/gemini-2.0-pro-exp-02-05:free');
    await testModel('google/gemini-flash-1.5');
    await testModel('google/gemini-pro-1.5');
}

run();
