export const prerender = false;

const SAKTI_API = 'https://fusesakti.kemenkeu.go.id/sakti/backend/asset-tetap/persetujuan/savePersetujuanTransaksional';

export async function PUT({ request }) {
    try {
        const body = await request.json();
        const { _headers, listPersetujuanWrapper, loginWrapper } = body;

        if (!_headers) {
            return new Response(JSON.stringify({ error: 'Missing authentication headers' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const headers = {
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        const requestBody = {
            listPersetujuanWrapper: listPersetujuanWrapper,
            transaksi: 1,
            loginWrapper: loginWrapper
        };

        const response = await fetch(SAKTI_API, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

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
