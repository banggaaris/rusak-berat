export const prerender = false;

const SAKTI_API = 'https://fusesakti.kemenkeu.go.id/sakti/backend/asset-tetap/assetTrx/savePengembangan';

export async function PUT({ request }) {
    try {
        const body = await request.json();

        // Extract custom headers from body
        const { _headers, ...requestBody } = body;

        if (!_headers) {
            return new Response(JSON.stringify({ error: 'Missing authentication headers' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Build headers for SAKTI API
        const headers = {
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Host': 'fusesakti.kemenkeu.go.id',
            'Origin': 'https://sakti.kemenkeu.go.id',
            'Referer': 'https://sakti.kemenkeu.go.id/',
            'SAKTI_SESSION_ID': _headers.sessionId,
            'SAKTI_TIMESTAMP': _headers.timestamp,
            'SAKTI_TOKEN_ID': _headers.tokenId,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        };

        // Forward request to SAKTI API
        const response = await fetch(SAKTI_API, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        const responseText = await response.text();

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { raw: responseText };
        }

        return new Response(JSON.stringify(responseData), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Proxy error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
