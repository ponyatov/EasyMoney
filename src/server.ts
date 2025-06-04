import config from './config.ts';
import app from './api.ts';

const port = parseInt(Deno.env.get('PORT') || config.PORT);

console.log(`EasyMoney API server starting on port ${port}...`);

Deno.serve({ port }, app.fetch);
