import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsed = parse(req.url!, true);
    handle(req, res, parsed);
  }).listen(parseInt(process.env.PORT || '3000', 10), () => {
    console.log(`> Ready on port ${process.env.PORT || 3000}`);
  });
});