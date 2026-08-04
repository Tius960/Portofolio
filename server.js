const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const rootDir = path.join(__dirname, 'public')
const dataDir = path.join(__dirname, 'data')
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

function setSecurityHeaders(res) {
  const headers = {
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  }

  Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value))
}

function resolveSafePath(baseDir, requestPath) {
  const normalized = path.normalize(requestPath)
  const relativePath = normalized === '/' ? 'index.html' : normalized.replace(/^\/+/g, '')
  const fullPath = path.resolve(baseDir, relativePath)
  const rootPath = path.resolve(baseDir)

  if (!fullPath.startsWith(rootPath + path.sep) && fullPath !== rootPath) {
    return null
  }

  return fullPath
}

const server = http.createServer((req, res) => {
  setSecurityHeaders(res)

  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname
  const filePath = pathname.startsWith('/data/')
    ? resolveSafePath(dataDir, pathname.replace(/^\/data\//, ''))
    : resolveSafePath(rootDir, pathname)

  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('403 Forbidden')
    return
  }

  const ext = path.extname(filePath)
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('404 Not Found')
      return
    }

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain; charset=utf-8' })
    res.end(content)
  })
})

server.listen(PORT, () => {
  console.log(`Node server running on http://127.0.0.1:${PORT}`)
})
