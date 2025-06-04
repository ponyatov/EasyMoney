import config from '../config.ts';
import app from './api.ts';

const port = parseInt(Deno.env.get('PORT') || config.PORT);

console.log(`EasyMoney API server starting on port ${port}...`);

const abortController = new AbortController();
const { signal } = abortController;

// Handle shutdown signals
Deno.addSignalListener("SIGINT", () => {
  console.log("SIGINT: Shutting down server...");
  abortController.abort();
});

Deno.addSignalListener("SIGTERM", () => {
  console.log("SIGTERM: Shutting down server...");
  abortController.abort();
});

await Deno.serve({ port, signal }, app.fetch).finished;
