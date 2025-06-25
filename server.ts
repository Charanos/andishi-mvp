// server.ts
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // If you’re not using Express:
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(parseInt(process.env.PORT || '3000', 10), () => {
    console.log(`> Ready on port ${process.env.PORT || 3000}`)
  })
})
