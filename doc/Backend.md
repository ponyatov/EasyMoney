# Backend

## **1. Minimalist Variant**

Best for [[Raspberry Pi]] and Low-End [[VPS]]

**Stack:**

- **Runtime**: [Deno](https://deno.land/) (TypeScript-native, no [[Node.js]])
- **Server**: [Hono](https://hono.dev/) (Ultralight HTTP, ~14KB)
- **Database**: [[SQLite]] (single-file, zero-config)
    
**Pros:**

✅ 10MB memory footprint  
✅ No build step (`deno run` directly executes TS)  
✅ Built-in crypto/web APIs

**Rust integration:**
- https://deno.com/blog/rusty-v8-stabilized
- [[Deno]] is a modern, zero-config [[JavaScript]] runtime written in Rust.
- At its core is [[Rusty#V8]], a library that provides high-quality, zero-overhead Rust bindings to [[V8]]’s C++ API. **Rusty V8 is now stable and production-ready**

## **2. High-Performance Variant**
### For Financial-Grade Workloads)

**Stack:**
- **Runtime**: Rust ([Actix Web](https://actix.rs/))
- **Database**: PostgreSQL + [Diesel ORM](https://diesel.rs/)
- **Auth**: [libpasta](https://github.com/libpasta/libpasta) (Rust-native)

**Pros:**  
✅ Sub-millisecond response times  
✅ Memory-safe transactions  
✅ ARM/x86_64 static binaries
