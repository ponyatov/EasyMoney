import config from './config.ts';
import api from './api.ts';

import style from './style.ts';

import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.204.0/http/file_server.ts";
import { join } from "https://deno.land/std@0.204.0/path/mod.ts";

const RELOAD_SCRIPT = `
<script>
  const socket = new WebSocket('ws://' + location.host + '/ws');
  socket.onmessage = () => location.reload();
</script>
`;

const clients = new Set<WebSocket>();
const watcher = Deno.watchFs("./src");

// Watch for file changes
(async () => {
  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create") {
      console.log(`File changed: ${event.paths.join(", ")}`);
      // Notify all clients
      clients.forEach((client) => {
        try {
          client.send("reload");
        } catch (err) {
          clients.delete(client);
        }
      });
    }
  }
})();

// Start server
const port = parseInt(Deno.env.get('LIVE') || config.PORT+1);

console.log(`Live reload server running at http://localhost:${port}`);

// Handle shutdown signals
const shutdown = () => {
  console.log("Shutting down livereload server...");
  watcher.close();
  clients.forEach(client => client.close());
  Deno.exit(0);
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);

serve(async (req) => {
  const url = new URL(req.url);
  
  // WebSocket connection
  if (url.pathname === "/ws") {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 400 });
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      clients.add(socket);
      console.log("Client connected");
    };
    
    socket.onclose = () => {
      clients.delete(socket);
      console.log("Client disconnected");
    };
    
    return response;
  }
  
  // Handle API requests
  if (url.pathname.startsWith("/api")) {
    // Rewrite URL to remove /api prefix
    req = new Request(
      new URL(url.pathname.replace(/^\/api/, "") + url.search, req.url),
      req
    );
    return api.fetch(req);
  }
  
  // Serve static files
  try {
    const filePath = url.pathname === "/" ? "./index.html" : "." + url.pathname;
    const response = await serveFile(req, filePath);
    
    // Inject reload script for HTML files
    if (filePath.endsWith(".html")) {
      const text = new TextDecoder().decode(response.body as Uint8Array);
      const injected = text.replace("</body>", `${RELOAD_SCRIPT}</body>`);
      return new Response(injected, {
        headers: response.headers,
        status: response.status,
      });
    }
    
    return response;
  } catch (e) {
    return new Response(`${style.STYLE}Not found`, { status: 404 });
  }
}, { port });
