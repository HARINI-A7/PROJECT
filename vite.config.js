import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ── OpenSky OAuth2 Proxy Plugin ────────────────────────────────────────────
// Intercepts requests to /api/opensky/* at the Vite dev-server level
// (Node.js process), fetches an OAuth2 Bearer token using credentials from
// the .env file, and forwards the request to OpenSky with auth headers.
// Credentials NEVER reach the browser bundle.
// ──────────────────────────────────────────────────────────────────────────
function openSkyProxyPlugin() {
  let _token = null
  let _tokenExpiry = 0

  async function getAccessToken(clientId, clientSecret) {
    if (_token && Date.now() < _tokenExpiry) return _token

    const res = await fetch(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    )
    if (!res.ok) {
      throw new Error(`OAuth2 token request failed: ${res.status} ${await res.text()}`)
    }
    const data = await res.json()
    _token = data.access_token
    _tokenExpiry = Date.now() + Math.max((data.expires_in - 30) * 1000, 0)
    return _token
  }

  return {
    name: 'vite-plugin-opensky-proxy',
    configureServer(server) {
      // Register middleware BEFORE Vite's internal handlers
      server.middlewares.use('/api/opensky', async (req, res) => {
        const clientId = process.env.OPENSKY_CLIENT_ID
        const clientSecret = process.env.OPENSKY_CLIENT_SECRET

        // req.url is the path AFTER the mount point, e.g. "/states/all?lamin=..."
        const targetUrl = `https://opensky-network.org/api${req.url || '/'}`

        try {
          const headers = {
            Accept: 'application/json',
            'User-Agent': 'FlightPulseAI/1.0',
          }

          if (clientId && clientSecret) {
            try {
              const token = await getAccessToken(clientId, clientSecret)
              if (token) headers.Authorization = `Bearer ${token}`
            } catch (err) {
              // Log warning but continue — unauthenticated requests still work
              // for public endpoints like /states/all
              console.warn('[OpenSky Proxy] OAuth2 failed, retrying without auth:', err.message)
            }
          }

          const upstream = await fetch(targetUrl, { headers })
          const body = await upstream.text()

          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(body)
        } catch (err) {
          console.error('[OpenSky Proxy] Error:', err.message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'proxy_error', message: err.message }))
        }
      })
    },
  }
}
// ── Sarvam AI Proxy Plugin ──────────────────────────────────────────────
// Uses loadEnv() to correctly read .env regardless of VITE_ prefix.
// process.env alone does NOT reliably contain non-VITE_ vars in Vite plugins.
// ──────────────────────────────────────────────────────────────────────────
function sarvamProxyPlugin() {
  return {
    name: 'vite-plugin-sarvam-proxy',
    configureServer(server) {
      // loadEnv(mode, cwd, '') loads ALL .env variables (empty prefix = all).
      // This correctly picks up SARVAM_API_KEY without requiring VITE_ prefix.
      const env = loadEnv(server.config?.mode || 'development', process.cwd(), '')
      const apiKey = env.SARVAM_API_KEY || env.VITE_SARVAM_API_KEY || process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY

      console.log(`[Sarvam Proxy] API key ${apiKey ? `found (length: ${apiKey.length})` : 'NOT FOUND ❌ — check SARVAM_API_KEY in .env'}`)

      // ── Health Check Endpoint ──
      server.middlewares.use('/api/sarvam/health', (req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          hasKey: Boolean(apiKey),
          keyLength: apiKey ? apiKey.length : 0,
        }))
      })

      // ── Main Proxy ──
      server.middlewares.use('/api/sarvam', async (req, res) => {
        if (!apiKey) {
          console.error('[Sarvam Proxy] ❌ Request blocked: SARVAM_API_KEY not found in .env')
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'MISSING_API_KEY', message: 'Sarvam API key missing or invalid. Check SARVAM_API_KEY in .env file.' }))
          return
        }

        // req.url is the path AFTER the mount point (e.g. "/v1/chat/completions")
        const targetUrl = `https://api.sarvam.ai${req.url || '/'}`
        console.log(`[Sarvam Proxy] → ${req.method} ${targetUrl}`)

        try {
          const proxyReqOptions = {
            method: req.method,
            headers: {
              'Content-Type': req.headers['content-type'] || 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
          }

          // Collect and forward the request body for POST/PUT
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            proxyReqOptions.body = Buffer.concat(chunks).toString()
          }

          const upstream = await fetch(targetUrl, proxyReqOptions)
          console.log(`[Sarvam Proxy] ← ${upstream.status} ${upstream.statusText}`)

          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')

          // Read body as ArrayBuffer and forward — fetch ReadableStream is NOT a Node stream
          const buffer = await upstream.arrayBuffer()
          res.end(Buffer.from(buffer))

        } catch (err) {
          console.error('[Sarvam Proxy] ❌ Error:', err.message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'proxy_error', message: err.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), openSkyProxyPlugin(), sarvamProxyPlugin()],
})
