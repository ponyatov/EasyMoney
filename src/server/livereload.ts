import config from '../config.ts';

import { serve } from 'std/http/server';
import { serveFile } from 'std/http/file_server';
import { join } from 'std/path';

const RELOAD_SCRIPT = `
<script>
  // Get client ID from cookie or generate a new one
  function getClientId() {
    const cookieName = 'livereload_client_id';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(cookieName + '=')) {
        return cookie.substring(cookieName.length + 1);
      }
    }
    // No cookie found, generate new ID
    const newId = 'client-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    // Set cookie with 15-minute expiration (900 seconds)
    document.cookie = cookieName + '=' + newId + ';path=/;max-age=900;samesite=strict';
    return newId;
  }
  
  // Update LED elements based on connection status
  function updateLedStatus(isOnline) {
    const ledElements = document.querySelectorAll('.led');
    ledElements.forEach(el => {
      if (isOnline) {
        el.classList.remove('offline');
        el.classList.add('online');
      } else {
        el.classList.remove('online');
        el.classList.add('offline');
      }
    });
  }
  
  const clientId = getClientId();
  console.log('LiveReload client ID:', clientId);
  
  // Create WebSocket connection
  const socket = new WebSocket('ws://' + location.host + '/ws?clientId=' + clientId);
  
  // Connection opened
  socket.onopen = () => {
    console.log('LiveReload connected');
    updateLedStatus(true);
  };
  
  // Connection closed
  socket.onclose = () => {
    console.log('LiveReload disconnected');
    updateLedStatus(false);
    
    // Try to reconnect after 3 seconds
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      window.location.reload();
    }, 3000);
  };
  
  // Connection error
  socket.onerror = (error) => {
    console.error('LiveReload error:', error);
    updateLedStatus(false);
  };
  
  // Handle messages (reload)
  socket.onmessage = () => location.reload();
  
  // Set initial state as offline until connection is established
  updateLedStatus(false);
  
  // Send ping every 30 seconds to keep connection alive
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send('ping');
    }
  }, 3000);
</script>
`;

// Store clients with their metadata
interface ClientInfo {
    socket: WebSocket;
    ip: string;
    id: string;
    connectedAt: Date;
}

const clients = new Map<WebSocket, ClientInfo>();
let clientCounter = 0;
const watcher = Deno.watchFs(['./src', './static']);

// Watch for file changes
(async () => {
    for await (const event of watcher) {
        if (event.kind === 'modify' || event.kind === 'create') {
            console.log(
                `[${new Date().toISOString()}] FILE ${event.kind.toUpperCase()} - ${event.paths.join(
                    ', '
                )}`
            );
            // Notify all clients
            // Count active clients
            const activeClients = clients.size;
            console.log(
                `[${new Date().toISOString()}] RELOAD - Notifying ${activeClients} client(s)`
            );

            // Send reload signal to all clients
            clients.forEach((clientInfo, socket) => {
                try {
                    socket.send('reload');
                    console.log(
                        `[${new Date().toISOString()}] RELOAD - Sent to client: ${
                            clientInfo.id
                        }`
                    );
                } catch (err) {
                    console.log(
                        `[${new Date().toISOString()}] RELOAD - Failed for client: ${
                            clientInfo.id
                        }`
                    );
                    clients.delete(socket);
                }
            });
        }
    }
})();

// Start server
const port = parseInt(Deno.env.get('LIVE') || config.PORT);

// Try to start the server, with fallback ports if the main one is in use
async function startServer(initialPort: number, maxRetries = 3) {
    let currentPort = initialPort;
    let retries = 0;

    while (retries <= maxRetries) {
        try {
            const timestamp = new Date().toISOString();
            console.log(
                `[${timestamp}] SERVER - Live reload server running at http://localhost:${currentPort}`
            );
            return { port: currentPort };
        } catch (err) {
            if (err instanceof Deno.errors.AddrInUse && retries < maxRetries) {
                const timestamp = new Date().toISOString();
                console.log(
                    `[${timestamp}] SERVER - Port ${currentPort} already in use, trying ${
                        currentPort + 1
                    }...`
                );
                currentPort++;
                retries++;
            } else {
                const timestamp = new Date().toISOString();
                console.error(
                    `[${timestamp}] ERROR - Failed to start server:`,
                    err
                );
                throw err;
            }
        }
    }
    const timestamp = new Date().toISOString();
    console.error(
        `[${timestamp}] ERROR - Could not find an available port after ${maxRetries} attempts`
    );
    throw new Error(
        `Could not find an available port after ${maxRetries} attempts`
    );
}

const serverOptions = await startServer(port);

// Create server controller
const controller = new AbortController();
const { signal } = controller;

// Handle shutdown signals
const shutdown = () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] SERVER - Shutting down livereload server...`);

    // Close file watcher
    try {
        watcher.close();
        console.log(`[${timestamp}] SERVER - File watcher closed`);
    } catch (err) {
        console.error(
            `[${timestamp}] ERROR - Failed to close file watcher:`,
            err
        );
    }

    // Close all WebSocket connections
    let closedClients = 0;
    clients.forEach((clientInfo, socket) => {
        try {
            socket.close(1000, 'Server shutting down');
            console.log(
                `[${timestamp}] WS - Closed connection: ${clientInfo.id}`
            );
            closedClients++;
        } catch (err) {
            console.error(
                `[${timestamp}] ERROR - Failed to close WebSocket for ${clientInfo.id}:`,
                err
            );
        } finally {
            clients.delete(socket);
        }
    });
    console.log(
        `[${timestamp}] SERVER - Closed ${closedClients} WebSocket connections`
    );

    // Abort the server controller to close the HTTP server
    controller.abort();
    console.log(`[${timestamp}] SERVER - HTTP server closed`);

    // Give time for connections to close before exiting
    console.log(`[${timestamp}] SERVER - Exiting process...`);
    setTimeout(() => Deno.exit(0), 200);
};

Deno.addSignalListener('SIGINT', shutdown);
Deno.addSignalListener('SIGTERM', shutdown);

serve(
    async (req) => {
        const url = new URL(req.url);
        const startTime = Date.now();
        const method = req.method;
        const path = url.pathname;

        console.log(
            `[${new Date().toISOString()}] ${method} ${path} - Request received`
        );

        // Create a wrapper function to log the response
        const logResponse = (response: Response, routeType: string) => {
            const duration = Date.now() - startTime;
            console.log(
                `[${new Date().toISOString()}] ${method} ${path} - ${
                    response.status
                } ${routeType} (${duration}ms)`
            );
            return response;
        };

        // WebSocket connection
        if (url.pathname === '/ws') {
            if (req.headers.get('upgrade') !== 'websocket') {
                return new Response('Expected websocket', { status: 400 });
            }

            const { socket, response } = Deno.upgradeWebSocket(req);

            socket.onopen = () => {
                // Extract client IP from request
                const forwardedFor = req.headers.get('x-forwarded-for');
                const ip = forwardedFor
                    ? forwardedFor.split(',')[0].trim()
                    : new URL(req.url).hostname || '127.0.0.1';

                // Get client ID from cookie, URL, or generate a new one
                let id;

                // Try to get from cookie first
                const cookieHeader = req.headers.get('cookie') || '';
                const cookies = cookieHeader.split(';');
                for (const cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'livereload_client_id' && value) {
                        id = value;
                        break;
                    }
                }

                // If not in cookie, try URL parameter
                if (!id) {
                    const urlParams = new URLSearchParams(url.search);
                    id = urlParams.get('clientId');
                }

                // If still not found, generate a new one
                if (!id) {
                    id = `client-${++clientCounter}-${Date.now().toString(36)}`;
                }

                // Store client info
                const clientInfo: ClientInfo = {
                    socket,
                    ip,
                    id,
                    connectedAt: new Date(),
                };

                clients.set(socket, clientInfo);
                console.log(
                    `[${new Date().toISOString()}] WS - Client connected: ${id} from ${ip} (${
                        clients.size
                    } total)`
                );
            };

            socket.onclose = () => {
                const clientInfo = clients.get(socket);
                clients.delete(socket);

                if (clientInfo) {
                    const duration =
                        Date.now() - clientInfo.connectedAt.getTime();
                    console.log(
                        `[${new Date().toISOString()}] WS - Client disconnected: ${
                            clientInfo.id
                        } from ${clientInfo.ip} after ${Math.round(
                            duration / 1000
                        )}s (${clients.size} total)`
                    );
                } else {
                    console.log(
                        `[${new Date().toISOString()}] WS - Unknown client disconnected (${
                            clients.size
                        } total)`
                    );
                }
            };

            return logResponse(response, 'WebSocket');
        }

        // Serve static files
        try {
            // Use absolute paths for serveFile
            const basePath = Deno.cwd();
            const relativePath =
                url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
            const filePath = join(basePath, config.STATIC, relativePath);

            // Log file request with type indication
            const fileType = filePath.endsWith('.json')
                ? 'JSON'
                : filePath.endsWith('.html')
                ? 'HTML'
                : filePath.endsWith('.js')
                ? 'JS'
                : filePath.endsWith('.css')
                ? 'CSS'
                : 'File';

            console.log(
                `[${new Date().toISOString()}] ${method} ${path} - Serving ${fileType}: ${filePath}`
            );
            const response = await serveFile(req, filePath);

            // Special handling for manifest.json
            if (filePath.endsWith('manifest.json')) {
                const headers = new Headers(response.headers);
                headers.set('Content-Type', 'application/manifest+json');
                headers.set('Cache-Control', 'no-cache');
                const manifestResponse = new Response(response.body, {
                    headers,
                    status: response.status,
                });
                return logResponse(manifestResponse, 'Manifest');
            }

            // Inject reload script for HTML files
            if (filePath.endsWith('.html')) {
                const text = new TextDecoder().decode(
                    response.body as Uint8Array
                );
                const injected = text.replace(
                    '</body>',
                    `${RELOAD_SCRIPT}</body>`
                );
                const htmlResponse = new Response(injected, {
                    headers: response.headers,
                    status: response.status,
                });
                return logResponse(htmlResponse, 'HTML');
            }

            return logResponse(response, 'Static');
        } catch (e) {
            // Generate a request ID for tracking
            const requestId = `req-${Date.now().toString(36)}-${Math.random()
                .toString(36)
                .substring(2, 7)}`;

            // Extract client ID from cookies if available
            const cookieHeader = req.headers.get('cookie') || '';
            let clientId = 'unknown';

            // Parse cookies to find livereload_client_id
            const cookies = cookieHeader.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'livereload_client_id' && value) {
                    clientId = value;
                    break;
                }
            }

            // Fallback to URL parameter if cookie not found
            if (clientId === 'unknown') {
                const urlParams = new URLSearchParams(url.search);
                clientId = urlParams.get('clientId') || 'unknown';
            }

            const notFoundResponse = new Response(
                `<!DOCTYPE html>
<html>
<head>
  <title>404 - Not Found</title>
  <link rel="stylesheet" href="/css.css">
  ${RELOAD_SCRIPT}
</head>
<body>
  <header>
    <h1 class=error>404 - Not Found</h1>
  </header>
  <main>
    <section>
      <p>The requested resource could not be found.</p>
      <p><small>Client ID: ${clientId}</small></p>
      <p><small>Request ID: ${requestId}</small></p>
      <p><small>Path: ${path}</small></p>
    </section>
  </main>
  <footer>
    <p class=led>EasyMoney</p>
  </footer>
</body>
</html>`,
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'text/html',
                        'X-Request-ID': requestId,
                    },
                }
            );
            return logResponse(notFoundResponse, 'NotFound');
        }
    },
    { port: serverOptions.port, signal }
);
