# PHASE 2: ARTIFICIAL INTELLIGENCE SUBSYSTEM IMPLEMENTATION PLAN
## ServeCircle Mobile — Multimodal Vision Diagnosis, Conversational Chat & Resilient Fallback Engine

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Security Boundary:** Zero API Keys in Mobile Binary; 100% Routed via Backend AI Gateway  
**Web Baseline:** Mapped from `server/routes/customerAi.js`, `server/ai/`, and `08-AI-FLOW-AUDIT.md`  

---

## 1. END-TO-END AI PIPELINE ARCHITECTURE

The Flutter application interacts with AI models through ServeCircle's centralized backend proxy. The mobile client never directly communicates with OpenAI, Anthropic, Gemini, or Groq servers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FLUTTER MOBILE CLIENT                            │
│                                                                             │
│  Camera / Gallery ──► Image Compressor (<1MB) ──► FormData Multipart        │
│  User Text Input  ──► Local Spell Normalizer  ──► Language Detector         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ POST /api/ai/chat or POST /api/ai/analyze
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVECIRCLE BACKEND GATEWAY (customerAi.js)              │
│                                                                             │
│  1. Intent Classification (SERVICE_PROBLEM, EMERGENCY, GENERAL, CHAT)       │
│  2. Hindi / Gujarati Transliteration & Normalization                        │
│  3. Emergency Guard: Immediately flags fire, gas leak, high-voltage risks   │
│  4. AIProviderManager.chatWithCustomer():                                   │
│     ├── Primary: Groq (Qwen 32B / Llama 3)                                  │
│     ├── Secondary: Google Gemini 1.5 Flash                                  │
│     └── Fallback: Local Canonical Rule-Based Inference Engine               │
│  5. Service Catalog Resolution (Maps diagnosis to real MongoDB service)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Structured JSON Response
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUTTER CLIENT CONSUMPTION                          │
│                                                                             │
│  • AIAnalysisResult DTO: (problem, urgency, confidence, pricing)            │
│  • AIServiceRecommendationCard: Direct "Book Now" CTA with populated service│
│  • Rich Chat Stream: Multilingual text bubble + interactive service cards   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MULTIMODAL VISION DIAGNOSIS FLOW (`/api/ai/analyze`)

The smart diagnosis workflow empowers non-technical users to point their smartphone camera at a broken household appliance, plumbing defect, or electrical fault and receive an immediate diagnostic assessment:

### 2.1 Mobile Capture & Pre-processing
1. **Camera / Gallery Trigger:** User taps camera button in `AISmartDiagnosisScreen`.
2. **Hardware Capture:** `image_picker` captures image from native Android camera.
3. **Client-side Compression:** `flutter_image_compress` compresses the JPEG:
   - Max resolution: 1920x1080
   - Quality: 80%
   - Target payload size: < 800 KB (guarantees fast transmission over 4G).
4. **Multipart Transmission:** Sent via `DioClient` with `FormData`:
   - `image`: Multipart file
   - `description`: Optional user text note
   - `categoryHint`: Optional selected hub

### 2.2 Response Schema & Dart DTO
```dart
// Conceptual model blueprint
class AIAnalysisResult {
  final String detectedProblem;       // e.g., "Corroded elbow joint with high-pressure drip"
  final String category;              // e.g., "Plumbing & Water"
  final String urgency;               // "low" | "medium" | "high" | "emergency"
  final double confidence;            // e.g., 0.94 (94%)
  final List<String> observedSymptoms;// ["Rusted pipe threads", "Active water droplet formation"]
  final List<String> safetyAdvice;    // ["Turn off main water stopcock immediately"]
  final AIServiceRecommendation? recommendedService;

  AIAnalysisResult({
    required this.detectedProblem,
    required this.category,
    required this.urgency,
    required this.confidence,
    required this.observedSymptoms,
    required this.safetyAdvice,
    this.recommendedService,
  });
}

class AIServiceRecommendation {
  final String serviceId;             // Mongo ID
  final String serviceName;           // "Emergency Pipe Leakage & Valve Repair"
  final double estimatedPrice;        // 499.0
  final String priceRange;            // "₹499 - ₹799"
  final String estimatedDuration;     // "45 mins"
  final String rationale;             // "Requires replacement of corroded 0.5-inch PVC elbow"
}
```

---

## 3. CONVERSATIONAL AI ASSISTANT (`/api/ai/chat`)

The conversational AI assistant provides interactive troubleshooting, cost estimations, and multi-turn advice:

### 3.1 Conversational State Machine
- **User Message Optimism:** User's message is immediately appended to the in-memory chat list with a "Sending" checkmark.
- **Typing Indicator:** Displays an animated 3-dot typing bubble while the backend processes the request.
- **Multilingual Recognition:** Automatically accepts and replies in English, Hindi (हिंदी), and Gujarati (ગુજરાતી), matching the user's input language.
- **Rich Recommendation Ingestion:** If the AI determines that a professional service is required, the assistant's response embeds an interactive `AIServiceRecommendationCard` directly inside the chat bubble!

### 3.2 Direct Checkout Deep Link
Tapping "Book Now" inside the AI recommendation card immediately pushes `BookingFlowScreen` pre-populated with:
- Selected Service: Auto-selected from diagnosis
- Category: Auto-selected
- Recommended Add-ons: Pre-checked
- Diagnosis Notes: Auto-attached to the booking for the assigned worker to review!

---

## 4. STANDALONE EXHIBITION DEMO FALLBACK AI ENGINE

To guarantee 100% demo success during the college exhibition—even if the campus firewall blocks Groq/Gemini API endpoints or if internet connectivity is completely lost—the Flutter client bundles an identical **Client-Side Deterministic AI Fallback Engine** (`DemoAIProvider`):

| Input Keywords / Category | Fallback Detected Problem | Recommended Service | Price | Urgency | Confidence |
|---|---|---|---|---|---|
| "leak", "pipe", "water", "drip", "नल", "પાણી" | Pipe joint corrosion with active water leakage | Emergency Pipe Leakage Repair | ₹499 | High | 94% |
| "ac", "cooling", "gas", "filter", "ઠંડક" | Condenser dust accumulation / Low refrigerant | AC Jet Servicing & Gas Refill | ₹1,299 | Medium | 89% |
| "spark", "electric", "fuse", "switch", "વીજળી" | Short circuit in junction box / Overloaded MCB | Emergency Electrical Short-Circuit Fix | ₹399 | Emergency | 98% |
| "cleaning", "sofa", "deep clean", "સફાઈ" | Surface fabric dust mite accumulation | Full Home & Sofa Foam Cleaning | ₹1,899 | Low | 91% |
| Default / General Inquiry | General appliance wear & maintenance inspection | Comprehensive Diagnostic Checkup | ₹299 | Low | 85% |

This ensures that any judge or visitor testing the AI features on the Android device receives an immediate, visually stunning diagnosis and recommendation card with zero lag and zero failure risk.
