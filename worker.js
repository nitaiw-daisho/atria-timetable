// ============================================================
// Cloudflare Worker — Perfect Gym API Proxy
// Environment variables (set in Cloudflare dashboard):
//   PG_CLIENT_SECRET — your Perfect Gym API Client Secret
// ============================================================

const ALLOWED_ORIGINS = [
  'https://nitaiw-daisho.github.io',
  'https://atriawellnessclub.com.au',
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const targetUrl = `https://api.perfectgym.com${url.pathname}${url.search}`;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.PG_CLIENT_SECRET}`,
      },
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
