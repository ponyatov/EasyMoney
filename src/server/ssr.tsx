import { Hono } from 'hono';
import { renderToReadableStream } from 'react-dom/server';
import App from '../client/app.tsx';

const app = new Hono();

app.get('*', async (c) => {
    const stream = await renderToReadableStream(<App />);
    return new Response(stream, {
        headers: { 'Content-Type': 'text/html' },
    });
});

Deno.serve({ port: 3000 }, app.fetch);
