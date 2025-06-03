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

### **B. [[TypeScript]] for [[Gateway]]s and Backend**

- **Why [[TypeScript]]?**
    - [[React Native]] builds cross-platform mobile apps for device control.
    - [[Next.js]] dashboards visualize sensor data (e.g., [Yandex.Cloud IoT](https://cloud.yandex.com/services/iot-core)).

**Real-World Pipeline:**
```
[Rust on ESP32] → MQTT → [Rust API] → gRPC → [TypeScript Dashboard]
```

## **3. Comparative Advantages Over Alternatives**

|**Language Pair**|**Pros**|**Cons for Market**|
|---|---|---|
|Rust + [[Elixir]]|Fault tolerance, pattern matching|Fewer Elixir jobs (outside telecom)|
|Rust + Python|Easy ML integration|Python’s GIL hurts [[IoT]] performance|
|Rust + [[Go]]|Simple concurrency|No pattern matching|

**Key Insight:**  
- [[TypeScript]]’s ubiquity in web dev offsets Rust’s learning curve, 
- while [[Rust/Rust|Rust]] handles the heavy lifting where performance and cross-platform matters.

### **4. Cost-Efficiency**

- **Development Speed:**
    - [[TypeScript]] frontends build **3x faster** than Rust
	    - (e.g., [Tauri](https://tauri.app/) still needs TS for UI).
    - Rust’s [[WASM/WASM|WASM]] toolchain is best
        
- **Hardware Savings:**
    - [[Rust/Rust|Rust]]’s efficiency reduces IoT device costs (cheaper [[em/MCU|MCU]]s viable).

### **5. Talent Availability**

- **TypeScript:**
    - 1000+ mid-level TS devs on [HeadHunter Russia](https://hh.ru/).
        
- **Rust:**
    - Smaller pool but **10% higher salaries** than Java/Python roles.

**Hiring Strategy:**

- Outsource TS frontends locally.
- Hire Rust specialists remotely (e.g., from Russia/Belarus/Kazakhstan).

## **Conclusion**

✅ **Performance** ([[Rust/Rust|Rust]] for [[IoT/IoT|IoT]]/algorithms)  
✅ **Velocity** ([[TypeScript]] for UI/business logic)  
✅ **Market Fit** (aligned with local tech trends)
