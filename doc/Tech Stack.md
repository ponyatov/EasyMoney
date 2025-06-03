# Tech Stack

- Limit: use only OpenSource and Free License techs & libraries
- Prefer: most easy to learn and simple to run components
- Hosting: both VPS/VPS and hardware hosting on x86_64 and Raspberry Pi devices

## **1. Core Languages**

|**Component**|**Technology**|**Rationale**|
|---|---|---|
|**Primary Application Code**|TypeScript|Rapid development, full-stack consistency|
|**Performance Modules**|Rust|Memory-safe zero-cost abstractions for financial math/hardware (no GC pauses)|
|**IoT/Hardware**|Rust ([[no_std]])|Zero-runtime footprint for bare-metal systems (ARM Cortex-M, RISC-V)|

## **2. Frontend**

## **3. Backend**

## **4. Mobile**

## **5. Databases**

## **6. IoT/Embedded**

## **7. Security**

## **8. DevOps**

## **Critical Integration Points**

1. **TypeScript ↔ Rust**
    - Node.js: [[napi-rs]] for native modules
    - Browser: WebAssembly ([[wasm-pack]])

## **Why This Stack?**

- **TypeScript**:
    - Unified language for business logic
    - Vast ecosystem for UI development
        
- **Rust**:
    - Fearless concurrency for transaction processing
    - WASM support for browser-based client-side computations
    - Zero-cost abstractions for embedded devices
