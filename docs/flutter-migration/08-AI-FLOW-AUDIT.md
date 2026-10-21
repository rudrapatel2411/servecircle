# 08 — AI FLOW AUDIT
## ServeCircle Flutter Migration — Complete AI Subsystem Specification

**Source:** Verified from server/routes/customerAi.js, server/routes/aiProvider.js, server/routes/internalAi.js, server/ai/

---

## AI ARCHITECTURE OVERVIEW

```
Customer App
    ¦
    ?
POST /api/ai/chat (or POST /api/ai/analyze)
    ¦ multipart/form-data: text + image + conversation[] + context
    ¦
    ?
customerAi.js route handler
    +-- classifyIntent() ? GENERAL_CONVERSATION | SERVICE_PROBLEM | FOLLOW_UP | OUT_OF_SCOPE
    +-- spellNormalize() ? Hindi/Gujarati spell correction
    +-- detectLanguage() ? english | hindi | gujarati
    +-- routeLeakageService() ? special leakage routing guard
    ¦
    ?
AIProviderManager.chatWithCustomer({ text, image, conversation, customerContext })
    ¦
    +-- Primary: Groq (Qwen 32B) — or configured active provider
    ¦   +-- PromptBuilder.buildChatPrompt() ? full system prompt
    ¦
    +-- Fallback (if provider fails):
    ¦   +-- Local CANONICAL_SERVICES mapping + template responses
    ¦
    ?
Response Building:
    +-- applyLeakageGuard() ? correct wrong service categories
    +-- applyServiceCategoryGuard() ? image-based category correction
    +-- CANONICAL_SERVICES lookup ? normalize to platform catalog
    +-- Service.findOne() ? DB lookup for live service data
    +-- buildAssistantMessage() ? multilingual reply text
    ¦
    ?
Response JSON:
    {
      reply: string,
      showServiceRecommendation: boolean,
      serviceName, serviceCategory, servicePrice, serviceSkill,
      serviceId, targetHubRoute,
      followUpQuestions: [],
      analysis: { ... multimodal detail ... }
    }
```

---

## AI INTENT CLASSIFICATION (CLIENT-SIDE LIKE LOGIC ON SERVER)

### classifyIntent(text, hasImage, conversation) ? Intent

| Intent | Trigger |
|--------|---------|
| `SERVICE_PROBLEM` | Has image OR service keywords detected |
| `GENERAL_CONVERSATION` | Greeting, help request, language preference |
| `FOLLOW_UP` | Short response in service context |
| `OUT_OF_SCOPE` | Unrelated to home services |

**Languages supported:** English, Hindi (Devanagari + romanized), Gujarati (native script + romanized)

**Spell normalization handles:**
- Plumbing: leakej?leakage, plumar?plumber, paani?pani, gizer?geyser
- Electrical: bijili?bijli, electrisian?electrician, swich?switch
- Appliance: frij?fridge, air conditionar?ac
- Carpentry: darwaza?door, khidki?window, almirah?wardrobe
- Cleaning: safaai?cleaning, cockroch?cockroach

---

## CANONICAL SERVICES CATALOG (HARDCODED FALLBACK)

20 service mappings with keyword matching:

| Service | Category | Skill | Price (INR) | Route |
|---------|----------|-------|-------------|-------|
| Plumbing | Home Repairs | Plumber | 350 | null |
| Electrical Work | Home Repairs | Electrician | 300 | null |
| AC & Appliance Repair | Home Repairs | AC Technician | 499 | null |
| Carpentry | Home Repairs | Carpenter | 400 | null |
| Painting & Waterproofing | Home Repairs | Painter | 600 | null |
| Sofa & Carpet Cleaning | Cleaning & Hygiene | Cleaning Specialist | 599 | /customer/general-services/cleaning-services |
| Home Deep Cleaning | Cleaning & Hygiene | Cleaning Specialist | 1200 | /customer/general-services/cleaning-services |
| Pest Control | Cleaning & Hygiene | Pest Controller | 899 | /customer/general-services/cleaning-services |
| Relocation & Packers | Relocation | Movers & Packers | 2500 | /customer/relocation |
| Driver & Chauffeur | Travel & Commute | Driver | 599 | /customer/travel-commute |
| Home Cook & Catering | Food & Kitchen | Cook | 499 | /customer/food-kitchen |
| Pet Grooming & Care | Pet Services | Pet Care Specialist | 450 | /customer/pet-services |
| Doctor & Healthcare | Health & Wellness | Healthcare Professional | 699 | /customer/health-wellness |
| Society Security | Society Management | Security Guard | 1500 | /customer/society-management |
| Events & Celebrations | Events | Event Coordinator | 2499 | /customer/events |
| Car Wash & Detailing | Vehicle Services | Car Detailer | 399 | /customer/services/vehicle-services |
| Car Repair | Vehicle Services | Car Mechanic | 799 | /customer/services/vehicle-services |
| Bike Repair | Vehicle Services | Bike Mechanic | 399 | /customer/services/vehicle-services |
| Home IT & CCTV | Home IT | IT Technician | 449 | null |
| Gardener & Lawn Care | Garden & Outdoor | Gardener | 399 | null |
| Emergency SOS Repair | Emergency Services | Emergency Technician | 499 | /customer/emergency |

---

## AI PROVIDERS

### Supported Providers
| Provider | Model | Purpose |
|---------|-------|---------|
| Gemini | gemini-2.0-flash | Default — text + multimodal |
| Groq | Qwen/QwQ 32B (or similar) | High-intelligence chat |

### Provider Management
- Hot-swappable at runtime via POST /api/ai/switch
- Health monitoring via GET /api/ai/health
- Admin can switch providers without restart

### AIProviderManager API
```javascript
AIProviderManager.initialize()           // Initialize with env config
AIProviderManager.chatWithCustomer({     // Main chat method
  text, image, conversation, customerContext
})
AIProviderManager.generateText(prompt)   // Raw text generation
AIProviderManager.getActiveProviderName() // 'gemini' | 'groq'
AIProviderManager.health()               // { ready, latency, model, ... }
AIProviderManager.getHealthSnapshot()    // Cached health object
AIProviderManager.switchProvider(name)   // Hot-switch
AIProviderManager.getRegisteredProviders() // List all
```

---

## MULTIMODAL IMAGE ANALYSIS PIPELINE

### Image Input Handling
```
1. Accept: multipart file upload OR base64 string OR remote URL (http/https)
2. Validation: validateImage() checks MIME type, size (max 20MB)
3. Encoding: Buffer ? base64 string ? sent to AI provider
4. MIME types: image/jpeg, image/png, image/webp
```

### Analysis Result Structure
```json
{
  "status": "success",
  "confidence": 0.82,
  "multimodal": {
    "problemAnalysis": {
      "problemCategory": "plumbing",
      "possibleProblems": [{ "id": "PLMB_001", "name": "Pipe Leakage" }],
      "confidence": { "score": 0.82, "level": "HIGH" },
      "aiAnalysisRaw": {
        "problemType": "Pipe Leakage",
        "serviceCategory": "plumbing",
        "urgency": "medium",
        "confidence": 0.82,
        "recommendedActions": ["Turn off water supply", "Keep area dry"],
        "visibleDamage": ["wet ceiling", "water stain"],
        "visibleObjects": ["pipe", "ceiling"],
        "possibleCauses": ["old pipe", "joint failure"],
        "needsMoreInformation": false,
        "followUpQuestions": []
      }
    },
    "serviceResolution": {
      "resolved": true,
      "service": "Plumbing",
      "category": "Home Repairs",
      "priceRangeInr": "?350 – ?1,200",
      "estimatedDurationLabel": "1-2 hours",
      "requiredWorkerSkill": "Plumber",
      "problemCategory": "plumbing",
      "safetyPrecautions": ["Turn off nearest water supply if leakage is active"]
    },
    "recommendation": {
      "recommendedService": { ... },
      "requiredSkill": { "primary": "Plumber" },
      "confidence": { "overall": { "score": 0.82, "level": "HIGH" } }
    },
    "summary": {
      "problemCategory": "plumbing",
      "topProblem": "Pipe Leakage",
      "resolvedService": "Plumbing",
      "requiredSkill": "Plumber",
      "urgencyLevel": "MEDIUM",
      "overallConfidence": { "score": 0.82, "level": "HIGH" }
    }
  }
}
```

---

## SERVICE CATEGORY GUARDS (HALLUCINATION PREVENTION)

After AI returns a result, server applies guards to correct hallucinated categories:

1. **Cleaning ? Plumbing guard:** If AI says "cleaning" but image/text has water/leak signals ? override to plumbing
2. **Cleaning ? Electrical guard:** If AI says "cleaning" but electrical signals present ? override to electrical
3. **Cleaning ? Appliance guard:** If AI says "cleaning" but appliance signals present ? override to appliance
4. **Unknown/Low-confidence guard:** If category unknown and confidence < 0.5 ? ask for more info

---

## LEAKAGE ROUTING LOGIC

Special routing for water leakage queries:

```
hasLeakageSignal() detects: "water leakage", "pani tapak", "leaking", etc.

routeLeakageService() then routes by source:
  - AC/air conditioner ? APPL_001 (Appliance)
  - Washing machine ? appliance
  - Pipe/tap/sink/bathroom/drain ? PLMB_001 or PLMB_004 (Plumbing)
  - Roof/ceiling ? FOLLOW_UP (ask about seepage vs pipe)
  - Unknown source ? FOLLOW_UP (ask follow-up questions)
```

---

## INTERNAL AI SYSTEM

### Feature Extraction (featureExtractor.js)
Extracts ML features from bookings for future model training.

### Model Registry (modelRegistry.js)
Manages registered ML model definitions.

### Inference Pipeline (inferenceService.js)
Runs full ML inference pipeline including feature extraction, prediction, explainability.

### Smart Cache (smartCache.js)
In-memory TTL cache for AI responses to avoid duplicate API calls.

### Explainability Service (explainabilityService.js)
Generates human-readable explanations of AI decisions.

---

## FLUTTER IMPLEMENTATION REQUIREMENTS

### AI Chat Screen
```dart
// Use: MultipartRequest (for image upload)
// API: POST /api/ai/chat
// Form fields:
//   text: String
//   image: File? (optional — from image_picker)
//   conversation: JSON string of List<{role, content}>
//   customerContext: JSON string of Map

// Response handling:
// - reply ? display as chat message
// - showServiceRecommendation ? show service card
// - followUpQuestions ? show as suggestion chips
// - targetHubRoute ? navigation intent for service hub
```

### AI Smart Diagnosis Screen
```dart
// Same as chat but with focus on image analysis
// Show confidence score
// Show recommended service with price
// Show "Book Now" CTA if showServiceRecommendation=true
```

### Service Card from AI Response
```dart
// Fields to display:
// - serviceName
// - serviceCategory
// - servicePrice (format as ?350)
// - serviceSkill
// - serviceId (for navigation to ServiceDetail)
// - targetHubRoute (for navigation to category hub)
```

### Language Support in AI Chat
```dart
// Send user's device locale in customerContext:
// customerContext: { "language": "hi" }
// OR detect from text on server side (server handles this automatically)
// Display AI responses as-is (mixed Hindi/Gujarati already in response)
```

---

## AI RATE LIMITS & ERROR HANDLING

| Error | Server Response | Flutter Handling |
|-------|----------------|-----------------|
| AI quota exceeded | 429-like error message | Show "AI is busy, try again" |
| Invalid image | 400 "Please upload a clear JPG/PNG/WEBP" | Show image validation error |
| Network error | 500/503 | Show retry button |
| Text too long | 400 | Truncate input |

### Error Messages (from sanitizeError())
- Quota/rate limit ? "AI is busy right now. Please retry in a bit or browse services manually."
- Image MIME error ? "Please upload a clear JPG, PNG, or WEBP image under the allowed size."
- Timeout/network ? "Network issue while connecting to AI. Please retry once."
- Other ? "AI assistant is temporarily unable to process this request. Please try again."
