
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('No API key found in .env.local');
        return;
    }

    console.log('Testing OpenRouter with key:', apiKey.substring(0, 10) + '...');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://localhost:3000',
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5',
                messages: [
                    { role: 'user', content: 'Suggest 1 sci-fi book. Return JSON: {"title": "Title"}' }
                ],
            }),
        });

        if (!response.ok) {
            console.error('API Error:', response.status, await response.text());
        } else {
            console.log('API Success:', await response.json());
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

testOpenRouter();
