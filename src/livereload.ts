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
const watcher = Deno.watchFs(["./src", "./static"]);

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

// Try to start the server, with fallback ports if the main one is in use
async function startServer(initialPort: number, maxRetries = 3) {
  let currentPort = initialPort;
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.log(`Live reload server running at http://localhost:${currentPort}`);
      return { port: currentPort };
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse && retries < maxRetries) {
        console.log(`Port ${currentPort} already in use, trying ${currentPort + 1}...`);
        currentPort++;
        retries++;
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Could not find an available port after ${maxRetries} attempts`);
}

const serverOptions = await startServer(port);

// Create server controller
const controller = new AbortController();
const { signal } = controller;

// Handle shutdown signals
const shutdown = () => {
  console.log("Shutting down livereload server...");
  
  // Close file watcher
  try {
    watcher.close();
    console.log("File watcher closed");
  } catch (err) {
    console.error("Error closing file watcher:", err);
  }
  
  // Close all WebSocket connections
  let closedClients = 0;
  clients.forEach(client => {
    try {
      client.close(1000, "Server shutting down");
      closedClients++;
    } catch (err) {
      console.error("Error closing WebSocket:", err);
    } finally {
      clients.delete(client);
    }
  });
  console.log(`Closed ${closedClients} WebSocket connections`);
  
  // Abort the server controller to close the HTTP server
  controller.abort();
  console.log("HTTP server closed");
  
  // Give time for connections to close before exiting
  console.log("Exiting process...");
  setTimeout(() => Deno.exit(0), 200);
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);

serve(async (req) => {
  const url = new URL(req.url);
  const startTime = Date.now();
  const method = req.method;
  const path = url.pathname;
  
  console.log(`[${new Date().toISOString()}] ${method} ${path} - Request received`);
  
  // Create a wrapper function to log the response
  const logResponse = (response: Response, routeType: string) => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${method} ${path} - ${response.status} ${routeType} (${duration}ms)`);
    return response;
  };
  
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
    
    return logResponse(response, "WebSocket");
  }
  
  // Handle API requests
  if (url.pathname.startsWith("/api")) {
    // Rewrite URL to remove /api prefix
    req = new Request(
      new URL(url.pathname.replace(/^\/api/, "") + url.search, req.url),
      req
    );
    const apiResponse = await api.fetch(req);
    return logResponse(apiResponse, "API");
  }
  
  // Serve static files
  try {
    const filePath = url.pathname === "/" ? 
      `${config.STATIC}/index.html` : 
      `${config.STATIC}${url.pathname}`;
    console.log(`[${new Date().toISOString()}] ${method} ${path} - Serving file: ${filePath}`);
    const response = await serveFile(req, filePath);
    
    // Inject reload script for HTML files
    if (filePath.endsWith(".html")) {
      const text = new TextDecoder().decode(response.body as Uint8Array);
      const injected = text.replace("</body>", `${RELOAD_SCRIPT}</body>`);
      const htmlResponse = new Response(injected, {
        headers: response.headers,
        status: response.status,
      });
      return logResponse(htmlResponse, "HTML");
    }
    
    return logResponse(response, "Static");
  } catch (e) {
    const notFoundResponse = new Response(`<!DOCTYPE html>
<html>
<head>
  <title>404 - Not Found</title>
  ${style.STYLE}
</head>
<body>
  <h1>404 - Not Found</h1>
  <p>The requested resource could not be found.</p>
</body>
</html>`, { 
      status: 404,
      headers: { "Content-Type": "text/html" }
    });
    return logResponse(notFoundResponse, "NotFound");
  }
}, { port: serverOptions.port, signal });
