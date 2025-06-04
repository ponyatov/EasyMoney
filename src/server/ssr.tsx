import { Hono } from 'hono';
import { renderToReadableStream } from 'react-dom/server';
import App from '../client/app.tsx';

const app = new Hono();

app.get('*', async (c) => {
    const stream = await renderToReadableStream(
        <App />,
        {
            bootstrapScripts: ['/client.js'],
            bootstrapModules: ['/client.js'],
        }
    );
    
    return new Response(stream, {
        headers: { 
            'Content-Type': 'text/html',
            'Color-Scheme': 'dark' 
        },
    });
});

Deno.serve({ port: 3000 }, app.fetch);
