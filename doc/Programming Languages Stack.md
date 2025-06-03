# Programming Languages Stack
## [[TypeScript]] + [[Rust/Rust|Rust]]

## **1. Technical Synergy**

### **A. Complementary Strengths**

|**[[Rust]]**|**[[TypeScript]]**|
|---|---|
|- [[zero-cost abstraction]]|- Rapid UI development|
|- Memory safety without GC|- Massive [[npm]] ecosystem|
|- [[pattern matching]] (`match`)|- Type inference + gradual typing|
|- Thin or nore runtime (no JVM/CLR)|- Browser/[[DOM]] integration|
|- [[WASM]] compilation|- Hot-reload for faster iteration|

**Why This Works:**

- [[Rust/Rust|Rust]]
	- compiles firmware into native machine code for IoT devices
	- compiles to WASM for performance-critical tasks (client-side)
- [[TypeScript]]
	- builds user interfaces and glues systems together

### **B. Seamless Interoperability**

- **[[JSON]]**: Both languages have best-in-class serialization ([[serde]] in Rust, [[zod]] in TS).
- **gRPC**: Shared protocol buffers ensure type-safe communication.
- **[[WASM/WASM|WASM]]**: Rust compiles to WASM for browser-based performance boosts.

## **2. [[IoT/IoT|IoT]] Integration Capabilities**

### **A. Rust for Embedded**

- **Why [[Rust/Rust|Rust]]?**

    - No runtime → perfect for [[esp/ESP32|ESP32]]/[[STM32]].
    - [[embedded-hal]] crate standardizes hardware access.
    - Example: Parsing [[proto/MODBUS/Modbus|Modbus]] frames with [[nom]] (pattern-matched parsers).

### **B. [[TypeScript]] for [[Gateway]]s**

- **Why [[TypeScript]]?**
    - [[React Native]] builds cross-platform mobile apps for device control.
    - [[Next.js]] dashboards visualize sensor data (e.g., [Yandex.Cloud IoT](https://cloud.yandex.com/services/iot-core)).

**Real-World Pipeline:**
```
[Rust on ESP32] → MQTT → [Rust API] → gRPC → [TypeScript Dashboard]
```
