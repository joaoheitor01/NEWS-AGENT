import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function apiDevBridge() {
  const routes = {
    '/api/noticias': path.resolve(process.cwd(), 'api/noticias.js'),
    '/api/cron': path.resolve(process.cwd(), 'api/cron.js'),
  }

  return {
    name: 'api-dev-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0]
        const handlerPath = routes[pathname]

        if (!handlerPath) {
          next()
          return
        }

        if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
          try {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const rawBody = Buffer.concat(chunks).toString('utf8')
            req.body = rawBody ? JSON.parse(rawBody) : {}
          } catch {
            req.body = {}
          }
        } else {
          req.body = {}
        }

        const sendJson = (statusCode, payload) => {
          res.statusCode = statusCode
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(payload))
        }

        res.status = (code) => ({
          json: (payload) => sendJson(code, payload),
        })

        res.json = (payload) => {
          sendJson(res.statusCode || 200, payload)
        }

        try {
          delete require.cache[require.resolve(handlerPath)]
          const handler = require(handlerPath)
          await handler(req, res)

          if (!res.writableEnded) {
            sendJson(500, { erro: 'Handler finalizou sem resposta.' })
          }
        } catch (error) {
          sendJson(500, { erro: error?.message || 'Erro interno no bridge de API.' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), apiDevBridge()],
  }
})
