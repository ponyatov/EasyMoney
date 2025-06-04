# Frontend

modern, lightweight **[[m/Frontend|Frontend]]** implementation using **[[Deno]]** (with [[Vite]]) and **Hono** for server-side rendering ([[Web/SSR|SSR]]) - all in [[TypeScript]]:

```
easymoney-frontend/
├── src/
│   ├── client/          # Client-side code
│   │   ├── app.tsx      # Main entry
│   │   └── hooks/       # Custom hooks
│   ├── server/          # SSR server
│   │   └── ssr.tsx      # SSR handler
│   ├── components/      # UI components
│   ├── styles/          # CSS modules
│   └── routes.tsx       # Routing config
├── deno.json            # Deno config
└── import_map.json      # Dependency mapping
```

