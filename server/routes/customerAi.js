import express from 'express';
import fs from 'fs';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { runMultimodalInference } from '../ai/inferenceService.js';
import { validateImage } from '../ai/multimodal/imageProcessor.js';
import { resolveService } from '../ai/multimodal/serviceResolver.js';
import { AIProviderManager } from '../ai/providers/AIProviderManager.js';
import { prisma } from '../config/prisma.js';

let staticCatalog = [];
try {
  const catalogPath = new URL('../constants/servicesCatalog.json', import.meta.url);
  staticCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
} catch {
  staticCatalog = [];
}

/**
 * Rapid candidate service selector. Filters the 110-item catalog down to the
 * top ~15-18 most relevant candidate services for the user's specific request.
 * Keeps Groq prompt size under 400 tokens, preventing TPM rate-limiting and
 * eliminating thinking/reasoning latency.
 */
export function filterCandidateServices(catalog, text = '', maxCandidates = 18) {
  if (!text || !text.trim() || !Array.isArray(catalog)) return [];
  const query = text.toLowerCase();
  const queryTokens = query.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);

  const keywordBoosts = {
    water: ['Home Repairs', 'Cleaning & Hygiene'],
    leak: ['Home Repairs'],
    pipe: ['Home Repairs'],
    tap: ['Home Repairs'],
    tapak: ['Home Repairs'],
    pani: ['Home Repairs', 'Cleaning & Hygiene'],
    ac: ['Home Repairs'],
    cooling: ['Home Repairs'],
    light: ['Home Repairs', 'Home IT & Tech Support'],
    fuse: ['Home Repairs'],
    bijli: ['Home Repairs'],
    electric: ['Home Repairs'],
    switch: ['Home Repairs'],
    fan: ['Home Repairs'],
    geyser: ['Home Repairs'],
    lock: ['Home Repairs'],
    door: ['Home Repairs'],
    paint: ['Home Repairs'],
    sofa: ['Cleaning & Hygiene', 'Furniture & Decor'],
    clean: ['Cleaning & Hygiene'],
    safai: ['Cleaning & Hygiene'],
    pest: ['Cleaning & Hygiene'],
    cockroach: ['Cleaning & Hygiene'],
    tank: ['Cleaning & Hygiene'],
    shift: ['Relocation & Packers'],
    packer: ['Relocation & Packers'],
    mover: ['Relocation & Packers'],
    driver: ['Travel & Commute', 'Utility & Daily Services'],
    car: ['Vehicle Services', 'Travel & Commute'],
    bike: ['Vehicle Services'],
    puncture: ['Vehicle Services'],
    battery: ['Vehicle Services'],
    cook: ['Food & Kitchen'],
    khana: ['Food & Kitchen'],
    dog: ['Pet Services'],
    pet: ['Pet Services'],
    doctor: ['Health & Wellness'],
    dawa: ['Health & Wellness'],
    medicine: ['Health & Wellness'],
    dadi: ['Care & Family', 'Health & Wellness', 'Kids & Elderly Care'],
    elder: ['Care & Family', 'Kids & Elderly Care'],
    cctv: ['Home IT & Tech Support'],
    wifi: ['Home IT & Tech Support'],
    tv: ['Home IT & Tech Support'],
  };

  const boostedCategories = new Set();
  for (const [kw, cats] of Object.entries(keywordBoosts)) {
    if (query.includes(kw)) {
      cats.forEach((c) => boostedCategories.add(c));
    }
  }

  const scored = catalog.map((service) => {
    let score = 0;
    const name = (service.name || '').toLowerCase();
    const cat = (service.category || '').toLowerCase();
    const desc = (service.description || '').toLowerCase();
    const id = (service.serviceId || '').toLowerCase();
    const tags = Array.isArray(service.tags) ? service.tags.join(' ').toLowerCase() : '';

    if (boostedCategories.has(service.category)) score += 30;
    if (query.includes(name) || name.includes(query)) score += 60;
    if (query.includes(id)) score += 60;

    // Check specific signal patterns for 100% exact task alignment
    for (const signal of SPECIFIC_ITEM_SIGNALS) {
      if (signal.serviceId === service.serviceId && signal.pattern.test(query)) {
        score += 150;
      }
    }

    for (const t of queryTokens) {
      if (id.includes(t)) score += 25;
      if (name.includes(t)) score += 20;
      if (cat.includes(t)) score += 12;
      if (tags.includes(t)) score += 10;
      if (desc.includes(t)) score += 5;
    }

    return { service, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const highScored = scored.filter((item) => item.score > 0);
  if (highScored.length >= 5) {
    return highScored.slice(0, maxCandidates).map((item) => item.service);
  }

  const selected = new Set(highScored.map((item) => item.service));
  for (const item of scored) {
    if (selected.size >= maxCandidates) break;
    selected.add(item.service);
  }
  return Array.from(selected);
}

// ── UNIVERSAL SPECIFICITY OVERRIDE REGISTRY ──────────────────────────────
// Guarantees that specific user requests (water tank, chimney, sofa, lock,
// battery, puncture, pet groom, etc.) are NEVER misclassified as generic
// umbrella services like Full Home Deep Cleaning, General Electrical Work, etc.
export const SPECIFIC_ITEM_SIGNALS = [
  // Cleaning & Hygiene specific tasks
  { serviceId: 'water-tank-clean', pattern: /\b(water\s*tank|tank\s*clean|overhead\s*tank|sintex\s*tank|sintex|tank\s*safai|tank\s*wash|tank\s*vacuum|dirty\s*tank|tank\s*dirty|tanki\s*safai|pani\s*ki\s*tanki)\b/i },
  { serviceId: 'sofa-cleaning', pattern: /\b(sofa|carpet|couch|upholstery|cushion|mattress|sofa\s*shampoo|sofa\s*dry\s*clean|carpet\s*clean|rug\s*clean|sofa\s*wash)\b/i },
  { serviceId: 'kitchen-deep-clean', pattern: /\b(chimney|kitchen\s*chimney|slab\s*oil|chimney\s*grease|kitchen\s*grease|chimney\s*safai|oily\s*slab|grease)\b/i },
  { serviceId: 'bathroom-deep-clean', pattern: /\b(bathroom\s*clean|toilet\s*clean|washroom\s*clean|bathroom\s*descale|toilet\s*stain|bathroom\s*stain|bathroom\s*safai|toilet\s*safai|washroom\s*safai)\b/i },
  { serviceId: 'fridge-cleaning', pattern: /\b(fridge\s*clean|refrigerator\s*clean|fridge\s*sanitiz|frij\s*safai|fridge\s*fungus|fridge\s*odor|fridge\s*smell|frij\s*clean)\b/i },
  { serviceId: 'pest-control', pattern: /\b(cockroach|kackroch|pest\s*control|pest\s*spray|termites|deemak|bed\s*bugs|khatmal|chuha|rodent\s*control|kida\s*safai)\b/i },

  // Home Repairs specific tasks
  { serviceId: 'geyser-repair', pattern: /\b(geyser|geysar|gizer|water\s*heater|garam\s*pani\s*heater|geyser\s*coil|geyser\s*thermostat|geyser\s*leak|geyser\s*install)\b/i },
  { serviceId: 'locksmith-pro', pattern: /\b(locksmith|chabi|chaabi|duplicate\s*key|key\s*maker|chabi\s*bana|chabi\s*kho|chaabi\s*bana|door\s*lock|lock\s*(?:jam|jammed|repair|broken|change|stuck|fix|toot)|deadlock|locked\s*out|lock\s*cylinder|key\s*stuck|darwaza\s*lock|key\s*nahi|key\s*gum|key\s*kho)\b/i },
  { serviceId: 'appliance-install', pattern: /\b(washing\s*machine|washer\s*install|washer\s*repair|dryer\s*repair|dishwasher\s*install|dishwasher\s*repair|washing\s*machine\s*repair)\b/i },
  { serviceId: 'water-purifier', pattern: /\b(water\s*purifier|ro\s*filter|ro\s*purifier|purifier\s*filter|kent\s*filter|aquaguard|water\s*filter|ro\s*service|ro\s*membrane|filter\s*badalna|kent\s*ro)\b/i },
  { serviceId: 'painter-pro', pattern: /\b(wall\s*paint|painting|whitewash|color\s*deewar|putty|seepage\s*paint|repainting|paint\s*karwana|wall\s*touch\s*up)\b/i },

  // Vehicle Services specific tasks
  { serviceId: 'battery-jumpstart', pattern: /\b(battery\s*jump|jumpstart|car\s*battery\s*dead|battery\s*down|battery\s*drained|jump\s*start|car\s*battery\s*down)\b/i },
  { serviceId: 'bike-puncture', pattern: /\b(puncture|punctur|tyre\s*puncture|flat\s*tyre|bike\s*puncture|scooter\s*puncture|hawa\s*nikal\s*gayi|tyre\s*air|tube\s*puncture)\b/i },
  { serviceId: 'dent-paint', pattern: /\b(denting|car\s*dent|scratch\s*remove|bumper\s*paint|car\s*scratch|panel\s*repaint|denting\s*painting|car\s*denting)\b/i },
  { serviceId: 'windshield-repair', pattern: /\b(windshield|windscreen|car\s*glass\s*crack|car\s*window\s*crack|windshield\s*crack|front\s*glass\s*crack)\b/i },
  { serviceId: 'car-wash', pattern: /\b(car\s*wash|foam\s*wash|car\s*cleaning|gadi\s*wash|car\s*polish|car\s*detailing|car\s*foam\s*wash|car\s*wash\s*ghar\s*pe)\b/i },
  { serviceId: 'car-detailing', pattern: /\b(ceramic\s*coating|ceramic\s*detailing|car\s*waxing|full\s*detail\s*car|interior\s*detailing)\b/i },
  { serviceId: 'engine-coolant', pattern: /\b(engine\s*oil|coolant|engine\s*fluid|coolant\s*flush|oil\s*change|engine\s*flush)\b/i },

  // Home IT & Tech Support specific tasks
  { serviceId: 'smart-tv-setup', pattern: /\b(tv\s*mount|tv\s*wall\s*mount|tv\s*fitting|tv\s*bracket|television\s*wall\s*mount|tv\s*install|led\s*tv\s*mount)\b/i },
  { serviceId: 'wifi-setup', pattern: /\b(wifi|wi-fi|wifi\s*router|mesh\s*wifi|internet\s*setup|wifi\s*speed|router\s*setup|wifi\s*dead\s*zone|router\s*install)\b/i },
  { serviceId: 'cctv-setup', pattern: /\b(cctv|security\s*camera|cctv\s*camera|cctv\s*install|camera\s*lagana|camera\s*fitting|dvr\s*setup)\b/i },
  { serviceId: 'smart-doorbell', pattern: /\b(video\s*doorbell|smart\s*doorbell|ring\s*doorbell|doorbell\s*install)\b/i },
  { serviceId: 'printer-install', pattern: /\b(printer|printer\s*install|wireless\s*printer|printer\s*setup)\b/i },
  { serviceId: 'pc-tuneup', pattern: /\b(laptop\s*repair|laptop\s*slow|computer\s*repair|malware|laptop\s*format|os\s*install)\b/i },

  // Furniture & Decor specific tasks
  { serviceId: 'curtain-installation', pattern: /\b(curtain\s*rod|curtain\s*track|parda\s*rod|blinds\s*install|curtain\s*bracket|parda\s*fitting)\b/i },
  { serviceId: 'wallpaper-install', pattern: /\b(wallpaper|wall\s*paper|wallpaper\s*install|wall\s*sticker|wallpaper\s*paste|wallpaper\s*lagana)\b/i },
  { serviceId: 'furniture-assembly', pattern: /\b(furniture\s*assembly|ikea|bed\s*assembly|wardrobe\s*assembly|table\s*assembly)\b/i },
  { serviceId: 'furniture-polish', pattern: /\b(wood\s*polish|furniture\s*polish|polish\s*wood|wood\s*restoration)\b/i },

  // Garden & Outdoor specific tasks
  { serviceId: 'welding-gate-fix', pattern: /\b(welding|iron\s*gate|grill\s*weld|channel\s*gate|weld\s*repair|gate\s*hinge\s*weld|loha\s*weld|lohe\s*ka\s*gate)\b/i },
  { serviceId: 'lawn-mowing', pattern: /\b(lawn\s*mow|lawn\s*mowing|grass\s*cut|lawn\s*edge|grass\s*trimming|ghas\s*katna|garden\s*grass)\b/i },
  { serviceId: 'plant-care', pattern: /\b(mali|gardener|plant\s*care|garden\s*clean|ped\s*paudhe|gamle\s*safai|garden\s*maintenance)\b/i },
  { serviceId: 'drip-irrigation', pattern: /\b(drip\s*irrigation|automatic\s*watering|drip\s*pipe|garden\s*irrigation)\b/i },

  // Pet Services specific tasks
  { serviceId: 'pet-grooming', pattern: /\b(pet\s*groom|dog\s*groom|cat\s*groom|pet\s*bath|dog\s*bath|cat\s*bath|puppy\s*bath|dog\s*spa|dog\s*haircut|pet\s*haircut|pet\s*nail|nail\s*clipping|puppy|kutte\s*ko\s*nahana)\b/i },
  { serviceId: 'pet-walking', pattern: /\b(dog\s*walk|pet\s*walk|puppy\s*walk|dog\s*trainer|dog\s*walking|kutta\s*ghumana)\b/i },
  { serviceId: 'aquarium-cleaning', pattern: /\b(fish\s*tank|aquarium|fish\s*aquarium|aquarium\s*clean|fish\s*tank\s*clean|machli\s*tank)\b/i },
  { serviceId: 'vet-visit', pattern: /\b(vet|veterinary|pet\s*doctor|dog\s*doctor|cat\s*doctor|pet\s*fever|dog\s*sick)\b/i },

  // Health & Wellness specific tasks
  { serviceId: 'physiotherapy', pattern: /\b(physio|physiotherapy|ortho|back\s*pain|knee\s*pain|joint\s*pain|shoulder\s*pain|slip\s*disc|kamar\s*dard|ghutne\s*ka\s*dard)\b/i },
  { serviceId: 'nurse-home-care', pattern: /\b(nurse|nursing|home\s*nurse|patient\s*care|iv\s*drip|injection\s*at\s*home|wound\s*dressing|dressing\s*change|saline)\b/i },
  { serviceId: 'lab-diagnostics', pattern: /\b(blood\s*test|lab\s*test|sample\s*collection|home\s*lab|blood\s*sample|urine\s*test|cbc\s*test|sugar\s*test)\b/i },
  { serviceId: 'doctor-visit', pattern: /\b(doctor|physician|doctor\s*visit|doctor\s*at\s*home|ghar\s*par\s*doctor|fever\s*doctor)\b/i },

  // Relocation & Packers specific tasks
  { serviceId: 'full-home-shifting', pattern: /\b(packers|movers|shifting|house\s*shift|relocation|samaan\s*shifting|ghar\s*shift|furniture\s*shifting|packing\s*moving)\b/i },
  { serviceId: 'single-item-transport', pattern: /\b(single\s*item|tempo|pickup\s*truck|fridge\s*transport|sofa\s*transport|chhota\s*hathi)\b/i },

  // Travel & Commute specific tasks
  { serviceId: 'airport-transfer', pattern: /\b(airport\s*cab|airport\s*taxi|airport\s*drop|airport\s*pickup|flight\s*cab)\b/i },
  { serviceId: 'outstation-chauffeur', pattern: /\b(outstation\s*driver|outstation\s*chauffeur|highway\s*driver|long\s*distance\s*driver|trip\s*driver)\b/i },
  { serviceId: 'driver-demand', pattern: /\b(driver|chauffeur|car\s*driver|driver\s*chahiye|driver\s*for\s*today|gadi\s*chalane\s*wala|temporary\s*driver)\b/i },

  // Care & Family specific tasks
  { serviceId: 'babysitting', pattern: /\b(babysitter|baby\s*sitter|nanny|child\s*care|baby\s*care|bachhe\s*ki\s*dekhbhal|aya)\b/i },
  { serviceId: 'elder-care', pattern: /\b(elder\s*care|senior\s*citizen\s*care|old\s*age\s*care|bujurg\s*ki\s*dekhbhal|senior\s*attendant)\b/i },
  { serviceId: 'beauty-home', pattern: /\b(salon\s*at\s*home|beauty\s*parlour|facial\s*at\s*home|pedicure|manicure|waxing\s*at\s*home)\b/i },
  { serviceId: 'makeup-artist', pattern: /\b(bridal\s*makeup|party\s*makeup|makeup\s*artist|mehndi\s*artist|wedding\s*makeup)\b/i },
  { serviceId: 'yoga-instructor', pattern: /\b(yoga|yoga\s*trainer|yoga\s*coach|yoga\s*teacher|yoga\s*class|pranayam)\b/i },
  { serviceId: 'cook-for-day', pattern: /\b(cook|khana\s*banane|rasoi|daily\s*cook|ghar\s*ka\s*khana|cook\s*chahiye|rasoiya|cook\s*lagwana)\b/i },
  { serviceId: 'society-security', pattern: /\b(security\s*guard|watchman|society\s*guard|guard\s*chahiye|chowkidar|society\s*security)\b/i },
  { serviceId: 'waterproofing', pattern: /\b(waterproof|waterproofing|roof\s*waterproof|terrace\s*waterproof|rain\s*seepage|monsoon\s*roof|chhat\s*waterproofing)\b/i },
];

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_IMAGE_SIZE_BYTES || String(20 * 1024 * 1024), 10) },
});

function safeJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function buildContextText(text, conversation = []) {
  const recent = Array.isArray(conversation) ? conversation.slice(-6) : [];
  const turns = recent
    .filter((item) => item?.role !== 'assistant' && typeof item?.content === 'string' && item.content.trim())
    .map((item) => `Customer: ${item.content.trim()}`)
    .join('\n');

  if (!turns) return text;
  return `Conversation context for analysis only:\n${turns}\n\nLatest customer message:\n${text || ''}`;
}

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Normalize common Hindi/Gujarati romanized spelling mistakes and variants
 * so that keyword matching still works even with typos.
 */
function spellNormalize(text = '') {
  let t = String(text).toLowerCase();

  // Plumbing variants
  t = t.replace(/\bleakej[a-z]*/g, 'leakage');
  t = t.replace(/\bleakig[a-z]*/g, 'leaking');
  t = t.replace(/\blikage\b/g, 'leakage');
  t = t.replace(/\bleakege\b/g, 'leakage');
  t = t.replace(/\bnanal\b/g, 'nal');
  t = t.replace(/\bnala\b/g, 'drain');
  t = t.replace(/\bplumber?s?\b/g, 'plumber');
  t = t.replace(/\bplumar\b/g, 'plumber');
  t = t.replace(/\bplambur\b/g, 'plumber');
  t = t.replace(/\bpaipa\b/g, 'pipe');
  t = t.replace(/\bpipe?s\b/g, 'pipe');
  t = t.replace(/\bpani\b/g, 'pani');
  t = t.replace(/\bpaani\b/g, 'pani');
  t = t.replace(/\bwatar\b/g, 'water');
  t = t.replace(/\btapak[a-z]*/g, 'tapak');
  t = t.replace(/\btopak\b/g, 'tapak');
  t = t.replace(/\btoilit\b/g, 'toilet');
  t = t.replace(/\btoilet[s]?\b/g, 'toilet');
  t = t.replace(/\bdrain[ij]+ng?\b/g, 'drain');
  t = t.replace(/\bgizer\b/g, 'geyser');
  t = t.replace(/\bgeysar\b/g, 'geyser');
  t = t.replace(/\bgeyser\b/g, 'geyser');

  // Electrical variants
  t = t.replace(/\bbijili\b/g, 'bijli');
  t = t.replace(/\bbijjli\b/g, 'bijli');
  t = t.replace(/\bbijale\b/g, 'bijli');
  t = t.replace(/\bvijali\b/g, 'bijli');
  t = t.replace(/\blight[s]?\b/g, 'light');
  t = t.replace(/\blite\b/g, 'light');
  t = t.replace(/\belectrisian\b/g, 'electrician');
  t = t.replace(/\belectrican\b/g, 'electrician');
  t = t.replace(/\belectritian\b/g, 'electrician');
  t = t.replace(/\belectricean\b/g, 'electrician');
  t = t.replace(/\belectric[ak]l?\b/g, 'electrical');
  t = t.replace(/\bswich\b/g, 'switch');
  t = t.replace(/\bswitsh\b/g, 'switch');
  t = t.replace(/\bsocet\b/g, 'socket');
  t = t.replace(/\bsoket\b/g, 'socket');
  t = t.replace(/\bshort.?circit\b/g, 'short circuit');
  t = t.replace(/\bspark[s]?\b/g, 'spark');

  // Appliance variants
  t = t.replace(/\bfrij\b/g, 'fridge');
  t = t.replace(/\bfrig\b/g, 'fridge');
  t = t.replace(/\bwashing machen\b/g, 'washing machine');
  t = t.replace(/\bwoshing machine\b/g, 'washing machine');
  t = t.replace(/\bair.?conditionar\b/g, 'ac');
  t = t.replace(/\bair.?condition[ea]r\b/g, 'ac');
  t = t.replace(/\ba\.?c\.?\b/g, 'ac');

  // Carpentry/door variants
  t = t.replace(/\bdor\b/g, 'door');
  t = t.replace(/\bdarwaja\b/g, 'door');
  t = t.replace(/\bdarwaza\b/g, 'door');
  t = t.replace(/\bkidki\b/g, 'window');
  t = t.replace(/\bkhidki\b/g, 'window');
  t = t.replace(/\balmirah\b/g, 'wardrobe');
  t = t.replace(/\balmira\b/g, 'wardrobe');

  // Security/lock variants
  t = t.replace(/\block[s]?\b/g, 'lock');
  t = t.replace(/\blok\b/g, 'lock');
  t = t.replace(/\bchabi\b/g, 'key');
  t = t.replace(/\bchaabi\b/g, 'key');
  t = t.replace(/\bchavi\b/g, 'key');

  // Cleaning variants
  t = t.replace(/\bsafaai\b/g, 'safai');
  t = t.replace(/\bsafai\b/g, 'cleaning');
  t = t.replace(/\bcockroch\b/g, 'cockroach');
  t = t.replace(/\bkackroch\b/g, 'cockroach');
  t = t.replace(/\b(dusrty|durty|dirti)\b/g, 'dirty');
  t = t.replace(/\bwater.?tank\b/g, 'water tank');

  // General corrections
  t = t.replace(/\bprobem\b/g, 'problem');
  t = t.replace(/\bprobelm\b/g, 'problem');
  t = t.replace(/\bproblem\b/g, 'problem');
  t = t.replace(/\brepare\b/g, 'repair');
  t = t.replace(/\brepir\b/g, 'repair');
  t = t.replace(/\bservise\b/g, 'service');
  t = t.replace(/\bservis\b/g, 'service');
  t = t.replace(/\bnahi chal[a-z]*/g, 'nahi chal raha');
  t = t.replace(/\bkaam nhi\b/g, 'kaam nahi');
  t = t.replace(/\bnhi\b/g, 'nahi');
  t = t.replace(/\bnai\b/g, 'nahi');

  return t;
}

/**
 * Detect language from text — supports Hindi, Gujarati, and English.
 */
function detectLanguage(text = '') {
  const raw = String(text);
  const lower = raw.toLowerCase();

  if (/[\u0A80-\u0AFF]/.test(raw)) return 'gujarati';
  if (/[\u0900-\u097F]/.test(raw)) return 'hindi';

  const gujaratiPatterns = [
    /\b(gujarati|kem cho|tame|shu|vaat|kari shako|moklo|tamari|chhe|nathi|joie|avo|jao|karo|che|kem|su che|tamne|taro|bahu|badhu|kevi)\b/,
    /\b(pani joie|koi problem|tamne koi|mane madad|ghar ma|mara ghar|tamari ghar)\b/,
  ];
  if (gujaratiPatterns.some(p => p.test(lower))) return 'gujarati';

  const hindiPatterns = [
    /\b(hai|hain|nahi|nai|nhi|main|mein|aap|apka|apni|karo|karna|karta|karti|chahiye|chahie|bata|batao|sakta|sakti|sakte|hoga|hogi|hote|bhi|toh|tto|yeh|ye|woh|wo|iska|uska|mera|tera|mujhe|aapko|hume|humko|kyun|kyon|kaise|kitna|kab|kahan|kya|agar|lekin|aur|par|pe|mein|se|ko|ka|ki|ke|ne)\b/,
    /\b(bijli|pani|ghar|kamra|chhat|deewar|darwaza|khidki|almirah|nalka|nali|paani|tapak|toota|toot|band|jam|jam gaya|chalu|chal raha|nahi chal|kaam nahi|help karo|bata do|samjha do|theek karo|theek karna|kab aayenge|kharcha|kitne mein|kitna lagega)\b/,
    /\b(kal|aaj|subah|shaam|raat|abhi|jaldi|urgent|turant|please|plz|pls|bhai|yaar|sir|madam)\b/,
  ];
  if (hindiPatterns.some(p => p.test(lower))) return 'hindi';

  const hinglishCues = /\b(nahi|nai|hain|karo|theek|toh|matlab|samjhe|achha|thik|bol|sab|bas|kuch|abhi|yahan|wahan)\b/.test(lower);
  if (hinglishCues) return 'hindi';

  return 'english';
}

export function classifyIntent({ text = '', hasImage = false, conversation = [] } = {}) {
  const normalized = normalizeText(spellNormalize(text));
  const priorText = normalizeText(spellNormalize(conversation.map((item) => item.content).join(' ')));
  const hasServiceHistory = /\b(leak|pipe|water|pani|ac|cooling|fan|switch|socket|light|lock|door|sink|tap|geyser|fridge|washing|clean|repair|plumber|electrician|leakage|toot|nahi|problem|issue|service|bijli|bijjli|socket|tapak|nali|nalka|darwaza|almirah)\b/.test(priorText);

  if (hasImage) return 'SERVICE_PROBLEM';

  const generalPatterns = [
    /^(hi|hello|hey|namaste|kem cho|hola|namaskar|salam)$/,
    /\b(how are you|what can you do|can you help|help me|need some help|i need help|services do you provide|thank|thanks|thank you|ok|okay|bye|shukriya|dhanyavad|shukriyo)\b/,
    /\b(can you speak|speak hindi|speak gujarati|hindi mein|gujarati ma|vaat kari shako|baat kar sakte|hindi me bolo|gujarati ma vaat karo)\b/,
  ];
  const isGeneral = generalPatterns.some((pattern) => pattern.test(normalized));
  if (isGeneral) {
    return 'GENERAL_CONVERSATION';
  }

  const correctionWithServiceSignal = /^(no|nahi|nai|nhi|na|nahi bhai)\b/.test(normalized) && /\b(water|pani|paani|leak|leakage|pipe|tap|sink|ac|washing|roof|bijli|socket|door|lock)\b/.test(normalized);
  if (correctionWithServiceSignal) return 'SERVICE_PROBLEM';

  const followUpPatterns = /^(yes|no|ha|haan|ji|ji ha|ji haan|nahi|na|only|sirf|bas|thodu|thoda|continuous|when|jab|tap|running|not sure|pata nahi|khabar nathi|thodi der|baad mein|abhi|haan bhai|ok bhai|theek hai)\b/;
  if (hasServiceHistory && (followUpPatterns.test(normalized) || normalized.length <= 36)) {
    return 'FOLLOW_UP';
  }

<<<<<<< HEAD
  const serviceKeywordsEN = /\b(leak|leaking|leakage|pipe|water|tap|sink|bathroom|toilet|drain|ac|cooling|fan|socket|switch|light|power|sparks|mcb|wire|wiring|lock|door|key|geyser|fridge|refrigerator|washing machine|repair|broken|cleaning|clean|pest|cockroach|seepage|short circuit|driver|chauffeur|airport|cab|commute|carpool|cook|chef|tiffin|catering|pet|dog|cat|vet|grooming|nurse|nursing|doctor|physio|physiotherapy|physiotherapist|caretaker|elder|health|society|security|security guard|guard|watchman|birthday|party|event|dj|photographer|car|bike|motorcycle|engine|car wash|detailing|mechanic|shifting|moving|relocation|packers|emergency|sos|paint|painting|wall|carpenter|carpentry|furniture|sofa|carpet|whitewash|putty|waterproofing|appliance|plumber|electrician|cctv|camera|wifi|router|laptop|computer|internet|tv|setup|install|installation|garden|gardener|lawn|service|book)\b/.test(normalized);
  const serviceKeywordsHI = /\b(pani|paani|tapak|bijli|bijjli|nali|nalka|nal|darwaza|khidki|kidki|chabi|chaabi|gizer|geysar|frij|safai|safaai|kida|chuha|toot|kharab|kharaab|band ho|nahi chal|kaam nahi|nahi aa rahi|problem hai|theek karo|repair karo|service chahiye|chahiye|lagwana|lagana|driver|driver chahiye|gaadi chalane|gadi chalana|outstation driver|khana|rasoi|tiffin|kutta|billi|dawa|doctor|nurse|caretaker|security guard|guard|watchman|society|bday|party|dj|car wash|gadi wash|mechanic|puncture|shifting|samaan shifting|relocation|packers|physio|paint|painting|rang|rangwana|deewar|wall|car|gadi|gaadi|bike|motorcycle|engine|chalu nahi|start nahi|badhiya|plumber|carpenter|electrician|badhai|cctv|camera|wifi|net|computer|sofa|carpet|mali|bagicha|plant)\b/.test(normalized);
  const serviceKeywordsGU = /\b(pani|nali|nal|door|khidki|chaabi|tamaro|tamari|ghar ma problem|mara ghar|koi toot|saru nathi|joie che|chahiye|madad joie|electrician joie|plumber joie|repair joie|safai joie|driver joie|gadi chalavva|chauffeur|rasoi|khana|pet|vet|doctor|nurse|guard|security|bday|party|gadi wash|car wash|mechanic|shifting|packers|physio|paint|rang|color|car|bike|gadi|motor|cctv|camera|wifi|sofa|mali|service)\b/.test(normalized);
=======
  // Direct check against all 110 specific platform services:
  if (SPECIFIC_ITEM_SIGNALS.some((item) => item.pattern.test(normalized))) {
    return 'SERVICE_PROBLEM';
  }

  // Service keywords for ALL ServeCircle platform hubs: English, Hindi/Hinglish, Gujarati
  const serviceKeywordsEN = /\b(leak|leaking|leakage|pipe|water|tap|sink|bathroom|toilet|drain|ac|cooling|fan|socket|switch|light|power|sparks|mcb|wire|wiring|lock|door|key|geyser|fridge|refrigerator|washing machine|repair|broken|cleaning|clean|pest|cockroach|seepage|short circuit|driver|chauffeur|airport|cab|commute|carpool|cook|chef|tiffin|catering|pet|dog|puppy|cat|vet|grooming|bath|spa|nail|nurse|nursing|doctor|physio|physiotherapy|physiotherapist|caretaker|elder|health|society|security|security guard|guard|watchman|birthday|party|event|dj|photographer|car|bike|motorcycle|engine|car wash|detailing|mechanic|shifting|moving|relocation|packers|emergency|sos|paint|painting|wall|carpenter|carpentry|furniture|sofa|carpet|whitewash|putty|waterproofing|appliance|plumber|electrician|cctv|camera|wifi|router|laptop|computer|internet|tv|setup|install|installation|garden|gardener|lawn|mow|mowing|service|book|chimney|grease|oil|oily|aquarium|fish tank|jumpstart|battery|puncture|denting|windshield|curtain|parda|wallpaper|welding|gate|inverter|purifier|ro|filter|babysitter|nanny|cake|laundry|ironing|tutor)\b/.test(normalized);
  const serviceKeywordsHI = /\b(pani|paani|tapak|bijli|bijjli|nali|nalka|nal|darwaza|khidki|kidki|chabi|chaabi|gizer|geysar|frij|safai|safaai|kida|chuha|toot|kharab|kharaab|band ho|nahi chal|kaam nahi|nahi aa rahi|problem hai|theek karo|repair karo|service chahiye|chahiye|lagwana|lagana|driver|driver chahiye|gaadi chalane|gadi chalana|outstation driver|khana|rasoi|tiffin|kutta|puppy|pilla|billi|dawa|doctor|nurse|caretaker|security guard|guard|watchman|society|bday|party|dj|car wash|gadi wash|mechanic|puncture|shifting|samaan shifting|relocation|packers|physio|paint|painting|rang|rangwana|deewar|wall|car|gadi|gaadi|bike|motorcycle|engine|chalu nahi|start nahi|badhiya|plumber|carpenter|electrician|badhai|cctv|camera|wifi|net|computer|sofa|carpet|mali|bagicha|plant|chimney|tel|machli|aquarium|loha|lohe ka|welding|wallpaper|parda|tanki|tank safai|garam pani)\b/.test(normalized);
  const serviceKeywordsGU = /\b(pani|nali|nal|door|khidki|chaabi|tamaro|tamari|ghar ma problem|mara ghar|koi toot|saru nathi|joie che|chahiye|madad joie|electrician joie|plumber joie|repair joie|safai joie|driver joie|gadi chalavva|chauffeur|rasoi|khana|pet|vet|doctor|nurse|guard|security|bday|party|gadi wash|car wash|mechanic|shifting|packers|physio|paint|rang|color|car|bike|gadi|motor|cctv|camera|wifi|sofa|mali|service|chimney|kutta|tanki)\b/.test(normalized);
>>>>>>> origin/main

  if (serviceKeywordsEN || serviceKeywordsHI || serviceKeywordsGU) return 'SERVICE_PROBLEM';

  return normalized ? 'OUT_OF_SCOPE' : 'GENERAL_CONVERSATION';
}

function hasLeakageSignal(text = '') {
  const normalized = normalizeText(spellNormalize(text));
  return /\b(water leakage|water leak|water leaking|water aa raha|pani leak|paani leak|pani tapak|paani tapak|pani aa raha|paani aa raha|leakage|leak|leaking|tapak|nal se pani|nali se pani|chhat se pani|seepage|seeped|nala overflow)\b/.test(normalized);
}

function priorLeakageContext(conversation = []) {
  return Array.isArray(conversation) && conversation
    .filter((item) => item?.role !== 'assistant')
    .some((item) => hasLeakageSignal(item.content));
}

export function routeLeakageService({ text = '', conversation = [] } = {}) {
  const normalized = normalizeText(text);
  const hasCurrentLeakage = hasLeakageSignal(text);
  const hasPriorLeakage = priorLeakageContext(conversation);
  const sourceAnswer = hasPriorLeakage && /\b(pipe|tap|sink|bathroom|kitchen|ac|washing machine|washer|roof|ceiling)\b/.test(normalized);

  if (!hasCurrentLeakage && !sourceAnswer) return null;

  const sourceText = `${normalized} ${hasPriorLeakage ? ' prior leakage' : ''}`;

  if (/\b(ac|air conditioner)\b/.test(sourceText)) {
    return buildLeakageGuard({
      problemCategory: 'appliance',
      problemId: 'APPL_001',
      problemName: 'AC Water Leakage',
      confidence: 0.82,
    });
  }

  if (/\b(washing machine|washer)\b/.test(sourceText)) {
    return buildLeakageGuard({
      problemCategory: 'appliance',
      problemName: 'Washing Machine Water Leakage',
      confidence: 0.76,
    });
  }

  if (/\b(pipe|tap|faucet|sink|bathroom|kitchen sink|drain)\b/.test(sourceText)) {
    return buildLeakageGuard({
      problemCategory: 'plumbing',
      problemId: /\b(tap|faucet)\b/.test(sourceText) ? 'PLMB_004' : 'PLMB_001',
      problemName: /\b(tap|faucet)\b/.test(sourceText) ? 'Tap/Faucet Leakage' : 'Pipe Leakage',
      confidence: 0.86,
    });
  }

  if (/\b(roof|ceiling)\b/.test(sourceText)) {
    return {
      intent: 'FOLLOW_UP',
      message: 'Samajh gaya. Roof/ceiling se water aa raha hai. Kya ye rain seepage hai, bathroom se seepage hai, ya pipe line upar se pass hoti hai?',
      showServiceRecommendation: false,
      followUpQuestions: [
        'Rain ke time hi leakage hoti hai?',
        'Ceiling ke upar bathroom ya water line hai?',
        'Kya photo bhej sakte hain?',
      ],
    };
  }

  return {
    intent: 'FOLLOW_UP',
    message: 'Samajh gaya. Water leakage ke liye source confirm karna zaroori hai. Kya leakage pipe se hai, tap/sink se, bathroom/drain se, ya AC/appliance se?',
    showServiceRecommendation: false,
    followUpQuestions: [
      'Pipe se leak ho raha hai',
      'Tap ya sink se leak ho raha hai',
      'Bathroom ya drain block hai',
    ],
  };
}

function buildLeakageGuard({ problemCategory, problemId = null, problemName, confidence }) {
  return {
    guardOnly: true,
    expectedCategory: problemCategory,
    fallback: buildResolvedRoute({ problemCategory, problemId, problemName, confidence }),
  };
}

function buildResolvedRoute({ problemCategory, problemId = null, problemName, confidence }) {
  const serviceResolution = resolveService({
    contextId: `leak_${Date.now()}`,
    problemCategory,
    possibleProblems: problemId ? [{ id: problemId, name: problemName, matchCount: 10 }] : [{ id: `ROUTE_${problemCategory}`, name: problemName, matchCount: 8 }],
    confidence: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' },
    aiAnalysisRaw: {
      problemType: problemName,
      serviceCategory: problemCategory,
      urgency: 'medium',
      confidence,
      recommendedActions: problemCategory === 'plumbing'
        ? ['Turn off the nearest water supply if leakage is active.', 'Keep the area dry until the worker arrives.']
        : ['Switch off the appliance if water is near electrical parts.', 'Avoid using it until inspected.'],
      needsMoreInformation: false,
      followUpQuestions: [],
    },
    missingInformation: [],
    status: 'ANALYZED',
  });

  return {
    intent: 'SERVICE_PROBLEM',
    message: problemCategory === 'plumbing'
      ? 'Samajh gaya. Leakage source plumbing side ka lag raha hai. Iske liye plumbing service suitable lag rahi hai.'
      : `Samajh gaya. ${problemName} appliance issue lag raha hai, cleaning nahi. Iske liye appliance repair suitable lag rahi hai.`,
    showServiceRecommendation: true,
    followUpQuestions: [],
    analysis: {
      status: 'success',
      confidence,
      multimodal: {
        problemAnalysis: {
          problemCategory,
          possibleProblems: [{ name: problemName }],
          confidence: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' },
          aiAnalysisRaw: {
            problemType: problemName,
            recommendedActions: serviceResolution.safetyPrecautions || [],
            followUpQuestions: [],
          },
        },
        serviceResolution,
        recommendation: {
          recommendedService: {
            name: serviceResolution.service,
            category: serviceResolution.category,
            priceRangeInr: serviceResolution.priceRangeInr,
            estimatedDurationLabel: serviceResolution.estimatedDurationLabel,
            safetyPrecautions: serviceResolution.safetyPrecautions || [],
          },
          requiredSkill: { primary: serviceResolution.requiredWorkerSkill },
          confidence: { overall: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' } },
        },
        summary: {
          problemCategory,
          topProblem: problemName,
          resolvedService: serviceResolution.service,
          requiredSkill: serviceResolution.requiredWorkerSkill,
          urgencyLevel: 'MEDIUM',
          overallConfidence: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' },
        },
      },
    },
  };
}

export function generalMessage(text = '') {
  const normalized = normalizeText(spellNormalize(text));
  const language = detectLanguage(text);

  if (/\b(gujarati|gujarati ma|vaat kari shako|gujarati me bolo)\b/.test(normalized)) {
    return 'Ha, bilkul! Tame Gujarati ma vaat kari shako cho. Tamari ghar-service problem mane janavo, athva photo moklo. Hu plumbing, electrical, cleaning, carpentry — koi pan service mate madad kari shakish.';
  }
  if (/\b(hindi|hindi mein|baat kar sakte|hindi me bolo|hindi me batao)\b/.test(normalized)) {
    return 'Bilkul! Main Hindi mein baat kar sakta hoon. Aap ghar mein kisi bhi cheez ki problem bataiye — pani ka leak, bijli ki problem, AC kharab, darwaza toot gaya, ya kuch aur. Main sahi service dhundh kar dunga.';
  }

  if (/\b(what can you do|services do you provide|kya kar sakte|kya help|madad karo|help chahiye|kya karte ho|kya services)\b/.test(normalized)) {
    if (language === 'gujarati') return 'Hu home-service problem samajva, sahi service identify karva ane booking sudhi lai java help kari shaku chu. Plumbing, electrical, cleaning, carpentry, painting, appliance repair, security, moving — badhi services mate photo moklo ya type karo.';
    if (language === 'hindi') return 'Main aapki ghar ki kisi bhi problem ko samjhkar sahi service dhundh sakta hoon. Plumbing, bijli, cleaning, carpentry, AC/fridge repair, lock service, ya shifting — bas photo bhejiye ya problem type kariye.';
    return 'I can understand home-service problems, analyze photos, ask follow-up questions, recommend the right service, and take you to booking. Try: plumbing, electrical, cleaning, carpentry, painting, appliance repair, or moving services.';
  }

  if (/\b(thank|thanks|thank you|shukriya|dhanyavad|shukriyo|aabhar)\b/.test(normalized)) {
    if (language === 'gujarati') return 'Welcome! Biji koi service help joie hoy to mane janavo. Hu hamesha yahan chu.';
    if (language === 'hindi') return 'Welcome! Aur kisi service mein help chahiye ho to kabhi bhi puchh sakte hain.';
    return 'You are welcome! Let me know anytime you need help with a service.';
  }

  if (/\b(bye|goodbye|alvida|phir milenge|ok bye)\b/.test(normalized)) {
    if (language === 'hindi') return 'Theek hai! Phir kab bhi zaroorat ho, main yahan hoon.';
    if (language === 'gujarati') return 'Theek chhe! Phir koi jaroor pade to mane yaad karo.';
    return 'Bye! I am here whenever you need help with a home service.';
  }

  if (language === 'gujarati') return 'Hello! Hu ServeCircle AI chu. Tamari ghar ni koi pan problem type karo — ya photo moklo. Plumbing, electrical, cleaning, carpentry, appliance repair — badha mate help karis.';
  if (language === 'hindi') return 'Hello! Main ServeCircle AI hoon. Aap ghar ki koi bhi problem type kar sakte hain ya photo bhej sakte hain — plumbing, bijli, cleaning, carpentry, ya appliance repair. Aapki language mein baat kar sakta hoon.';
  return 'Hey! I am ServeCircle AI. Tell me what needs fixing at home, or send a photo. I understand English, Hindi, and Gujarati.';
}

function sanitizeError(err) {
  const message = String(err?.message || '').toLowerCase();
  if (/\b(quota|rate_limit|rate limit|too many requests|429)\b/i.test(message)) {
    return 'AI is busy right now. Please retry in a bit or browse services manually.';
  }
  if (message.includes('image') || message.includes('mime') || message.includes('unsupported')) {
    return 'Please upload a clear JPG, PNG, or WEBP image under the allowed size.';
  }
  if (message.includes('timeout') || message.includes('network') || message.includes('econnrefused')) {
    return 'Network issue while connecting to AI. Please retry once.';
  }
  return 'AI assistant is temporarily unable to process this request. Please try again.';
}

const AI_CITY_COORDS = {
  ahmedabad: [23.0225, 72.5714], bhavnagar: [21.7645, 72.1519], surat: [21.1702, 72.8311],
  vadodara: [22.3072, 73.1812], rajkot: [22.3039, 70.8022], jamnagar: [22.4707, 70.0577],
  dwarka: [22.2442, 68.9685], somnath: [20.8880, 70.4012], junagadh: [21.5222, 70.4579],
  bhuj: [23.2420, 69.6669], udaipur: [24.5854, 73.7125], 'mount abu': [24.5926, 72.7156],
  jaipur: [26.9124, 75.7873], jodhpur: [26.2389, 73.0243], mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567], goa: [15.2993, 74.1240], delhi: [28.6139, 77.2090],
  agra: [27.1767, 78.0081], bengaluru: [12.9716, 77.5946], bangalore: [12.9716, 77.5946],
  mysore: [12.2958, 76.6394], coorg: [12.3375, 75.8069], hyderabad: [17.3850, 78.4867],
  indore: [22.7196, 75.8577],
};

const AI_EXACT_ROUTE_KM = {
  'ahmedabad|udaipur': 260, 'bhavnagar|udaipur': 350, 'ahmedabad|mount abu': 225,
  'ahmedabad|jaipur': 660, 'ahmedabad|dwarka': 440, 'ahmedabad|somnath': 410,
  'ahmedabad|surat': 265, 'ahmedabad|vadodara': 112, 'ahmedabad|rajkot': 215,
  'ahmedabad|mumbai': 525, 'bhavnagar|ahmedabad': 175, 'bhavnagar|somnath': 260,
  'bhavnagar|dwarka': 410, 'surat|mumbai': 280, 'surat|udaipur': 485,
  'mumbai|pune': 150, 'mumbai|goa': 590, 'delhi|jaipur': 280,
  'delhi|agra': 230, 'bengaluru|mysore': 145, 'bengaluru|coorg': 265,
};

function estimateCityPairKmFromText(cleanText = '') {
  const matchedCities = [];
  for (const key of Object.keys(AI_CITY_COORDS)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(cleanText)) {
      matchedCities.push(key);
    }
  }
  if (matchedCities.length < 2) return null;
  const [c1, c2] = matchedCities;
  if (AI_EXACT_ROUTE_KM[`${c1}|${c2}`]) return AI_EXACT_ROUTE_KM[`${c1}|${c2}`];
  if (AI_EXACT_ROUTE_KM[`${c2}|${c1}`]) return AI_EXACT_ROUTE_KM[`${c2}|${c1}`];
  const [lat1, lon1] = AI_CITY_COORDS[c1];
  const [lat2, lon2] = AI_CITY_COORDS[c2];
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const straight = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(40, Math.round((straight * 1.28) / 5) * 5);
}

/**
 * Dynamic Fare & Pricing Calculator for ServeCircle AI Chatbot
 * Identical formulas to client/src/utils/pricingEngine.js so UI & AI always match.
 */
function computeDynamicChatPrice({ text = '', serviceName = '', category = '', basePrice = 350, aiEstimatedPrice = null }) {
  const clean = (text || '').toLowerCase();
  let price = null;
  let breakdown = '';
  let isDynamic = false;

  // 1. Distance extraction (or auto-estimate from Pickup & Drop city names):
  let km = null;
  const kmRegex = /(?:(\d+(?:\.\d+)?)\s*(?:km|kms|kilometer|kilometres|kilo|k\.m\.)|(?:distance|door|safar|drive|travel|gaye|jana|chala|kitna).{0,15}?(\d+(?:\.\d+)?)\s*(?:km|kms)?)/i;
  const kmMatch = clean.match(kmRegex);
  if (kmMatch) {
    const val = parseFloat(kmMatch[1] || kmMatch[2]);
    if (!isNaN(val) && val > 0 && val < 5000) {
      km = val;
    }
  }
  if (!km) {
    const directKm = clean.match(/(\d{2,4})\s*(?:km|kms)\b/i);
    if (directKm) km = parseFloat(directKm[1]);
  }
  if (!km) {
    km = estimateCityPairKmFromText(clean);
  }
  const isRoundTrip = /round.?trip|return|wapas|both side|up\s*and\s*down|up\s*down/i.test(clean);

  // 2. Point-to-Point Pick & Drop (Airport / Railway / Bus / Any Place) vs Outstation Drive Mode & Vehicle classification
  const isAirport = /airport|flight|terminal|hawai adda|airport pickup|airport drop/i.test(clean) || /airport/i.test(serviceName);
  const isRailway = /railway|train|station|junction|kalupur|sabarmati|ndls|pnr/i.test(clean);
  const isBus = /bus|bus stand|bus terminal|isbt|gsrtc|brts/i.test(clean);
  const isPickDrop = isAirport || isRailway || isBus || (/pick\s*(?:&|and|up)?\s*drop|pickup.*drop|drop.*pickup/i.test(clean) && !/outstation|multi.?day/i.test(clean));
  const isSelfDrive = /self.?drive|without driver|no driver|bina driver|khud chalani|khud drive/i.test(clean);

  const isTempo = /tempo|traveller|12 seater|minibus/i.test(clean);
  const isLuxury = /luxury|mercedes|bmw|audi|jaguar|mustang|lexus|porsche|roll|royce|range rover|achhi brand|acche brand|top brand|top model|vip/i.test(clean);
  const isPremiumSuv = /innova|crysta|hycross|fortuner|safari|xuv700|7 seater|seven seater/i.test(clean);
  const isCompactSuv = /suv|ertiga|creta|harrier|scorpio|seltos|brezza|badi gadi/i.test(clean);
  const isHatchback = /hatchback|swift|i20|wagonr|baleno|alto|tiago|chhoti gadi/i.test(clean);
  const isSedan = /sedan|dzire|city|verna|etios|amaze|car|gadi|gaadi/i.test(clean);

  // 3. Days extraction
  let days = 1;
  const daysMatch = clean.match(/(\d+)\s*(?:day|days|din|raat|night|nights)\b/i);
  if (daysMatch) {
    days = Math.min(30, Math.max(1, parseInt(daysMatch[1], 10)));
  }

  // 4. BHK extraction
  let bhk = null;
  const bhkMatch = clean.match(/(\d+)\s*(?:bhk|bedroom|bed room|room|kamra)\b/i);
  if (bhkMatch) {
    bhk = Math.min(6, Math.max(1, parseInt(bhkMatch[1], 10)));
  }

  // 5. Guest extraction
  let guests = null;
  const guestMatch = clean.match(/(\d+)\s*(?:guest|guests|people|person|persons|log|vyakti|jana)\b/i);
  if (guestMatch) {
    guests = Math.min(200, Math.max(1, parseInt(guestMatch[1], 10)));
  }

  const isNight = /night|raat|late night|overnight|der raat/i.test(clean);

  const isTravel = isPickDrop ||
                   /travel|driver|commute|chauffeur|cab|taxi|rental|outstation|self.?drive/i.test(category) ||
                   /driver|chauffeur|travel|outstation|car rental/i.test(serviceName) ||
                   /driver|gadi chalane|gaadi driver|outstation|travel|self.?drive/i.test(clean) ||
                   (km && (isLuxury || isTempo || isPremiumSuv || isCompactSuv || isHatchback || isSedan || /gadi|gaadi|car|drive/i.test(clean)));

  const isRelocation = /relocat|packer|mover|shifting/i.test(category) ||
                       /relocat|packer|mover|shifting/i.test(serviceName) ||
                       /shift|pack|relocat|samaan shifting|room shift|house shift/i.test(clean);

  const isFood = /food|kitchen|cook|catering/i.test(category) ||
                 /cook|chef|catering|tiffin/i.test(serviceName) ||
                 /khana|rasoi|cook|chef/i.test(clean);

  const isCleaning = /clean|hygiene/i.test(category) || /cleaning/i.test(serviceName);

  if (isPickDrop) {
    const dist = km || 18;
    const basePickup = isAirport ? 199 : (isRailway || isBus) ? 129 : 99;
    const hubLabel = isAirport ? 'Airport Transfer' : isRailway ? 'Railway Station Pick & Drop' : isBus ? 'Bus Terminal Pick & Drop' : 'Point-to-Point Pick & Drop';
    const distCharge = Math.round(dist * 18);
    const subtotal = basePickup + distCharge;
    const nightFee = isNight ? Math.round(subtotal * 0.25) : 0;
    price = subtotal + nightFee;
    breakdown = `${hubLabel} (Standard AC Cab • ${dist} km @ ₹18/km = ₹${distCharge.toLocaleString('en-IN')} + ₹${basePickup} pickup base${nightFee ? ` + ₹${nightFee} night surcharge` : ''})`;
    isDynamic = true;
  } else if (isTravel) {
    let perKm = isSelfDrive ? 12 : 14;
    let dailyFee = isSelfDrive ? 1200 : 500;
    let tierTitle = 'Sedan (Dzire / Honda City)';
    let effectiveSelfDrive = isSelfDrive;

    if (isTempo) {
      perKm = 28;
      dailyFee = 900;
      tierTitle = 'Tempo Traveller (12-Seater, With Driver)';
      effectiveSelfDrive = false;
    } else if (isLuxury) {
      perKm = isSelfDrive ? 34 : 38;
      dailyFee = isSelfDrive ? 3500 : 1200;
      tierTitle = 'Luxury Fleet (Mercedes / BMW / Audi)';
    } else if (isPremiumSuv) {
      perKm = isSelfDrive ? 19 : 22;
      dailyFee = isSelfDrive ? 2100 : 700;
      tierTitle = 'Premium SUV (Innova Crysta / Hycross)';
    } else if (isCompactSuv) {
      perKm = isSelfDrive ? 15 : 17;
      dailyFee = isSelfDrive ? 1600 : 600;
      tierTitle = 'Compact SUV (Ertiga / Creta)';
    } else if (isHatchback) {
      perKm = isSelfDrive ? 10 : 11;
      dailyFee = isSelfDrive ? 900 : 400;
      tierTitle = 'Hatchback (Swift / i20)';
    }

    const modeLabel = effectiveSelfDrive ? 'Self Drive (No Driver)' : 'With Driver';

    if (km) {
      const billedKm = isRoundTrip ? km * 2 : km;
      const transitFare = Math.round(billedKm * perKm);
      const durationFare = dailyFee * days;
      price = transitFare + durationFare;
      breakdown = `${tierTitle} [${modeLabel}] • ${billedKm} km${isRoundTrip ? ' (Round Trip)' : ''} @ ₹${perKm}/km (₹${transitFare.toLocaleString('en-IN')}) + ${days}d ${effectiveSelfDrive ? 'self-drive rental' : 'driver allowance'} (₹${durationFare.toLocaleString('en-IN')})`;
      isDynamic = true;
    } else {
      price = dailyFee * days;
      breakdown = `${tierTitle} [${modeLabel}] (${days} day @ ₹${dailyFee.toLocaleString('en-IN')}/day + ₹${perKm}/km by distance)`;
      isDynamic = true;
    }
  } else if (isRelocation) {
    const bhkTable = { 1: 3500, 2: 6500, 3: 10500, 4: 15500, 5: 21000 };
    const bhkCount = bhk || 2;
    const baseMoving = bhkTable[bhkCount] || 6500;
    const dist = km || 25;
    const transitFee = Math.round(dist * 16);
    price = baseMoving + transitFee;
    breakdown = `${bhkCount}BHK loading & packing (₹${baseMoving.toLocaleString('en-IN')}) + ${dist} km transit truck fare @ ₹16/km (₹${transitFee.toLocaleString('en-IN')})`;
    isDynamic = true;
  } else if (isFood && guests && guests > 4) {
    const extra = guests - 4;
    price = 599 + (extra * 110);
    breakdown = `Home Chef base (up to 4 guests: ₹599) + ${extra} additional guests @ ₹110/guest`;
    isDynamic = true;
  } else if (isCleaning && bhk) {
    const cleanTable = { 1: 999, 2: 1499, 3: 1999, 4: 2799 };
    price = cleanTable[bhk] || 1499;
    breakdown = `Full Deep Cleaning for ${bhk}BHK home`;
    isDynamic = true;
  }

  if (!price) {
    if (aiEstimatedPrice && typeof aiEstimatedPrice === 'number' && aiEstimatedPrice > 0 && aiEstimatedPrice !== 350 && aiEstimatedPrice !== 599 && aiEstimatedPrice !== 2000) {
      price = aiEstimatedPrice;
      breakdown = 'Custom verified estimate for your request';
      isDynamic = true;
    } else {
      price = basePrice;
    }
  }

  return { price, explanation: breakdown, isDynamic };
}

router.post(
  '/chat',
  optionalAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (req.user && req.user.role && req.user.role !== 'customer') {
      throw new AppError('This AI assistant is available only for customers.', StatusCodes.FORBIDDEN);
    }

    const text = String(req.body?.text || '').trim();
    const conversation = safeJson(req.body?.conversation, []);
    const customerContext = safeJson(req.body?.customerContext, {});
    const bookingContext = safeJson(req.body?.bookingContext, {});
    let availableServices = staticCatalog.filter((service) => service.isActive !== false);

    try {
      const dbServices = await prisma.service.findMany({
        where: { isActive: true, isDeleted: false },
        select: {
          id: true,
          serviceId: true,
          name: true,
          category: true,
          description: true,
          basePrice: true,
          tags: true,
          isActive: true,
          isDeleted: true,
        },
      });
      if (dbServices.length > 0) {
        availableServices = dbServices;
      }
    } catch (catalogError) {
      console.warn('[customerAi /chat] Could not load PostgreSQL services:', catalogError.message);
    }

    let image = null;
    if (req.file) {
      image = {
        base64: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype || 'image/jpeg',
        fileName: req.file.originalname,
        sizeBytes: req.file.size,
      };

      const validation = validateImage(image);
      if (!validation.isValid) {
        throw new AppError(validation.errors[0] || 'Invalid image upload.', StatusCodes.BAD_REQUEST);
      }
    } else if (req.body?.imageUrl) {
      image = {
        base64: String(req.body.imageUrl),
        mimeType: 'image/jpeg',
        fileName: 'remote_image.jpg',
      };
    } else if (req.body?.image && typeof req.body.image === 'string') {
      const raw = req.body.image;
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        image = {
          base64: raw,
          mimeType: 'image/jpeg',
          fileName: 'remote_image.jpg',
        };
      } else {
        const mimeMatch = raw.match(/^data:([^;]+);base64,/);
        const cleanBase64 = raw.replace(/^data:[^;]+;base64,/, '');
        image = {
          base64: cleanBase64,
          mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
          fileName: 'uploaded_image.jpg',
        };
      }
    }

    if (!text && !image) {
      throw new AppError('Please enter a message or attach a photo.', StatusCodes.BAD_REQUEST);
    }

    try {
      await AIProviderManager.initialize();

      const classifiedIntent = classifyIntent({ text, hasImage: Boolean(image), conversation });
      const isPureGeneral = classifiedIntent === 'GENERAL_CONVERSATION' || classifiedIntent === 'OUT_OF_SCOPE';
      const recentTurnContext = [
        ...conversation.slice(-3).map((c) => c.content || ''),
        text,
      ].filter(Boolean).join(' ');
      const servicesForPrompt = isPureGeneral ? [] : filterCandidateServices(availableServices, recentTurnContext, 24);

      let aiResponse = null;
      try {
        aiResponse = await AIProviderManager.chatWithCustomer({
          text,
          image,
          conversation,
          services: servicesForPrompt,
          customerContext: {
            ...customerContext,
            ...bookingContext,
          },
        });
      } catch (providerErr) {
        console.warn('[customerAi /chat] Provider failed; returning a retry message:', providerErr.message);
        const failureLanguage = detectLanguage(text);
        aiResponse = {
          intent: 'CLARIFY',
          reply: failureLanguage === 'hindi'
            ? 'Abhi main service list check nahi kar pa raha hoon. Thodi der baad dobara message bhejiye; aapko apni baat phir se samjhane ki zaroorat nahi hai.'
            : failureLanguage === 'gujarati'
            ? 'Atyare hu service list check kari shakto nathi. Thodi vaar pachhi fari message mokaljo; tamare vaat fari samjavani jarur nathi.'
            : 'I cannot check the service list right now. Please try again shortly; you do not need to explain your request again.',
          showServiceRecommendation: false,
          serviceId: '',
          serviceName: '',
          category: '',
          problemType: '',
          urgency: 'Scheduled',
          requiredWorkerSkill: 'Technician',
          estimatedPrice: 0,
          safetyPrecautions: [],
          followUpQuestions: [],
        };
      }

<<<<<<< HEAD
      // Comprehensive canonical catalog mapper covering all ServeCircle services
      const CANONICAL_SERVICES = [
        {
          keywords: ['plumb', 'leak', 'pipe', 'tap', 'drain', 'toilet', 'water', 'nali', 'nalka', 'tapak', 'washbasin', 'flush', 'sink', 'geyser', 'tank'],
          name: 'Plumbing',
          category: 'Home Repairs',
          skill: 'Plumber',
          price: 350,
          targetHubRoute: null,
        },
        {
          keywords: ['electric', 'wire', 'switch', 'power', 'light', 'fan', 'bijli', 'socket', 'fuse', 'mcb', 'short circuit', 'spark', 'board', 'wiring'],
          name: 'Electrical Work',
          category: 'Home Repairs',
          skill: 'Electrician',
          price: 300,
          targetHubRoute: null,
        },
        {
          keywords: ['ac', 'air condition', 'appliance', 'fridge', 'refrigerator', 'washing', 'cool', 'microwave', 'cooler', 'oven', 'purifier'],
          name: 'AC & Appliance Repair',
          category: 'Home Repairs',
          skill: 'AC Technician',
          price: 499,
          targetHubRoute: null,
        },
        {
          keywords: ['carpent', 'wood', 'furniture', 'door', 'window', 'darwaza', 'khidki', 'lock', 'handle', 'hinge', 'almirah', 'wardrobe', 'drawer', 'bed', 'chabi', 'chaabi'],
          name: 'Carpentry',
          category: 'Home Repairs',
          skill: 'Carpenter',
          price: 400,
          targetHubRoute: null,
        },
        {
          keywords: ['paint', 'wall', 'color', 'rang', 'putty', 'primer', 'whitewash', 'seepage', 'dampness', 'waterproof'],
          name: 'Painting & Waterproofing',
          category: 'Home Repairs',
          skill: 'Painter',
          price: 600,
          targetHubRoute: null,
        },
        {
          keywords: ['sofa', 'carpet', 'couch', 'upholstery', 'mattress'],
          name: 'Sofa & Carpet Cleaning',
          category: 'Cleaning & Hygiene',
          skill: 'Cleaning Specialist',
          price: 599,
          targetHubRoute: '/customer/general-services/cleaning-services',
        },
        {
          keywords: ['clean', 'deep clean', 'safai', 'house cleaning', 'flat clean', 'home clean', 'bathroom clean', 'kitchen clean'],
          name: 'Home Deep Cleaning',
          category: 'Cleaning & Hygiene',
          skill: 'Cleaning Specialist',
          price: 1200,
          targetHubRoute: '/customer/general-services/cleaning-services',
        },
        {
          keywords: ['pest', 'termite', 'cockroach', 'khatmal', 'bed bug', 'deemak', 'mosquito', 'insect', 'chuha', 'chuhe', 'rodent', 'kida'],
          name: 'Pest Control',
          category: 'Cleaning & Hygiene',
          skill: 'Pest Controller',
          price: 899,
          targetHubRoute: '/customer/general-services/cleaning-services',
        },
        {
          keywords: ['shift', 'pack', 'relocat', 'mover', 'packers', 'transport', 'samaan', 'room shift', 'house shift'],
          name: 'Relocation & Packers',
          category: 'Relocation & Packers',
          skill: 'Movers & Packers',
          price: 2500,
          targetHubRoute: '/customer/relocation',
        },
        {
          keywords: [
            'driver', 'chauffeur', 'cab', 'taxi', 'airport', 'flight', 'hawai adda', 'railway', 'train', 'station',
            'bus stand', 'bus terminal', 'pickup', 'pick & drop', 'drop', 'dropoff', 'outstation', 'self drive', 'self-drive',
            'car rental', 'car', 'gadi', 'gaadi', 'gadi chalane', 'gaadi driver', 'hatchback', 'sedan', 'suv', 'innova', 'crysta',
            'hycross', 'ertiga', 'creta', 'fortuner', 'swift', 'dzire', 'bmw', 'mercedes', 'audi', 'mustang', 'tempo', 'traveller',
            'travel', 'travelling', 'traveling', 'commute', 'km', 'kilometer', 'kilometre', 'journey', 'trip', 'tour', 'ride', 'rides',
            'bhavnagar', 'udaipur', 'ahmedabad', 'mumbai', 'surat', 'pune', 'delhi', 'vadodara', 'rajkot', 'jaipur', 'mount abu', 'dwarka', 'somnath',
            'kiraya', 'bhaada', 'bhada', 'fare', 'trip cost', 'travelling cost', 'travel cost'
          ],
          name: 'City, Station, Airport & Outstation Rides',
          category: 'Travel & Commute',
          skill: 'Driver',
          price: 599,
          targetHubRoute: '/customer/travel-commute',
        },
        {
          keywords: ['cook', 'chef', 'khana', 'rasoi', 'catering', 'tiffin', 'meal', 'bhojan'],
          name: 'Home Cook & Catering',
          category: 'Food & Kitchen',
          skill: 'Cook',
          price: 499,
          targetHubRoute: '/customer/food-kitchen',
        },
        {
          keywords: ['pet', 'dog', 'cat', 'kutta', 'billi', 'groom', 'vet', 'dog walk', 'pet bath'],
          name: 'Pet Grooming & Care',
          category: 'Pet Services',
          skill: 'Pet Care Specialist',
          price: 450,
          targetHubRoute: '/customer/pet-services',
        },
        {
          keywords: ['doctor', 'nurse', 'physio', 'physiotherapy', 'health', 'patient', 'elder', 'caretaker', 'dawa', 'medical'],
          name: 'Doctor & Healthcare at Home',
          category: 'Health & Wellness',
          skill: 'Healthcare Professional',
          price: 699,
          targetHubRoute: '/customer/health-wellness',
        },
        {
          keywords: ['society', 'security guard', 'gate', 'watchman', 'rwa', 'building', 'guard'],
          name: 'Society Security & Maintenance',
          category: 'Society Management',
          skill: 'Security Guard',
          price: 1500,
          targetHubRoute: '/customer/society-management',
        },
        {
          keywords: ['event', 'birthday', 'party', 'decor', 'dj', 'sound', 'celebration', 'photographer', 'wedding'],
          name: 'Events & Celebrations',
          category: 'Events & Celebrations',
          skill: 'Event Coordinator',
          price: 2499,
          targetHubRoute: '/customer/events',
        },
        {
          keywords: ['car wash', 'gadi wash', 'foam wash', 'detailing'],
          name: 'Car Wash & Detailing',
          category: 'Vehicle Services',
          skill: 'Car Detailer',
          price: 399,
          targetHubRoute: '/customer/services/vehicle-services',
        },
        {
          keywords: ['car repair', 'car mechanic', 'engine', 'four wheeler', 'car breakdown', 'car puncture', 'car service'],
          name: 'Car Repair',
          category: 'Vehicle Services',
          skill: 'Car Mechanic',
          price: 799,
          targetHubRoute: '/customer/services/vehicle-services',
        },
        {
          keywords: ['bike', 'motorcycle', 'scooter', 'two wheeler', 'puncture', 'activa'],
          name: 'Bike Repair',
          category: 'Vehicle Services',
          skill: 'Bike Mechanic',
          price: 399,
          targetHubRoute: '/customer/services/vehicle-services',
        },
        {
          keywords: ['cctv', 'camera', 'wifi', 'router', 'laptop', 'computer', 'internet', 'smart tv'],
          name: 'Home IT & CCTV Support',
          category: 'Home IT & Tech Support',
          skill: 'IT Technician',
          price: 449,
          targetHubRoute: null,
        },
        {
          keywords: ['garden', 'lawn', 'plant', 'grass', 'pot', 'pruning', 'gardener', 'mali'],
          name: 'Gardener & Lawn Care',
          category: 'Garden & Outdoor',
          skill: 'Gardener',
          price: 399,
          targetHubRoute: null,
        },
        {
          keywords: ['emergency', 'urgent', 'sos', 'immediately', 'turant', 'breakdown'],
          name: 'Emergency SOS Repair',
          category: 'Emergency Services',
          skill: 'Emergency Technician',
          price: 499,
          targetHubRoute: '/customer/emergency',
        },
      ];

      // Word-boundary safe keyword matcher (prevents 'rat' matching 'rates', 'ac' matching 'pack', 'cat' matching 'location', etc.)
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasWordMatch = (haystack, kw) => {
        const escaped = escapeRegex(kw.toLowerCase());
        return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, 'iu').test(haystack);
      };

      const userHistoryText = Array.isArray(conversation)
        ? conversation.filter((c) => c?.role === 'user').slice(-3).map((c) => c.content || '').join(' ')
        : '';
      const primarySignals = `${text || ''} ${aiResponse?.serviceName || ''} ${aiResponse?.category || ''}`.toLowerCase();
      const contextSignals = `${primarySignals} ${userHistoryText}`.toLowerCase();
      const hasTravelIntent = /\b(travel|travelling|traveling|trip|tour|ride|rides|driver|chauffeur|cab|taxi|outstation|suv|innova|crysta|ertiga|creta|swift|dzire|sedan|hatchback|tempo|traveller|self\s*drive|self-drive|bhavnagar|udaipur|ahmedabad|mumbai|surat|pune|delhi|vadodara|rajkot|jaipur|mount abu|dwarka|somnath|pickup|drop|commute|airport|railway|bus\s*stand|bhaada|kiraya|fare|trip cost|travelling cost)\b/i.test(contextSignals);

      const scoreService = (svc, signalText) => {
        // If customer intent is clearly travel/rides, suppress cleaning, pest control, events, etc.
        if (hasTravelIntent && svc.category !== 'Travel & Commute') {
          return 0;
        }

        let score = 0;
        for (const kw of svc.keywords) {
          if (hasWordMatch(signalText, kw)) {
            score += kw.includes(' ') ? 3 : 2;
          }
        }
        if (aiResponse?.category && svc.category.toLowerCase() === aiResponse.category.toLowerCase()) {
          score += 3;
        }
        if (hasTravelIntent && svc.category === 'Travel & Commute') {
          score += 15;
        }
        return score;
      };

      let matchedCanonical = null;
      let bestScore = 0;
      for (const svc of CANONICAL_SERVICES) {
        const s = scoreService(svc, primarySignals);
        if (s > bestScore) {
          bestScore = s;
          matchedCanonical = svc;
        }
      }
      if (!matchedCanonical && userHistoryText) {
        for (const svc of CANONICAL_SERVICES) {
          const s = scoreService(svc, contextSignals);
          if (s > bestScore) {
            bestScore = s;
            matchedCanonical = svc;
          }
        }
      }

      const classified = classifyIntent({ text, hasImage: Boolean(image), conversation });
      let showRecommendation = Boolean(
        (aiResponse && aiResponse.showServiceRecommendation && aiResponse.serviceName && (!hasTravelIntent || aiResponse.category === 'Travel & Commute')) ||
        (matchedCanonical && (classified === 'SERVICE_PROBLEM' || image || hasLeakageSignal(text) || hasTravelIntent))
      );

      if (!showRecommendation && matchedCanonical && (text.length > 3 || image)) {
        showRecommendation = true;
      }

      let dbService = null;
      if (showRecommendation && mongoose.connection.readyState === 1) {
        try {
          const lookupName = matchedCanonical?.name || aiResponse?.serviceName || '';
          if (lookupName) {
            const foundDb = await Service.findOne({
              name: { $regex: new RegExp(lookupName.trim(), 'i') },
            }).lean().catch(() => null);
            if (foundDb && (!matchedCanonical || foundDb.category === matchedCanonical.category)) {
              dbService = foundDb;
            }
          }
        } catch {
          dbService = null;
=======
      if (isPureGeneral && !image && aiResponse) {
        aiResponse.showServiceRecommendation = false;
        aiResponse.serviceId = '';
        aiResponse.serviceName = '';
      }

      const normalizeServiceName = (str) =>
        String(str || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

      let matchedCanonical = null;
      const rawAiServiceId = String(aiResponse?.serviceId || '').trim();
      const rawAiName = String(aiResponse?.serviceName || '').trim();
      const responseIntent = String(aiResponse?.intent || 'CLARIFY').toUpperCase();
      const intentCanRecommend = !isPureGeneral && (responseIntent === 'SERVICE_REQUEST' || responseIntent === 'FOLLOW_UP');

      // Resolve only an exact catalog ID or exact service name selected by the
      // model. Text keyword matches are not sufficient to create a booking card.
      if (rawAiServiceId) {
        matchedCanonical = availableServices.find((service) => service.serviceId === rawAiServiceId) || null;
      }
      if (!matchedCanonical && rawAiName) {
        const exactName = normalizeServiceName(rawAiName);
        matchedCanonical = availableServices.find((service) => normalizeServiceName(service.name) === exactName) || null;
        if (!matchedCanonical && exactName.length > 3) {
          matchedCanonical = availableServices.find((service) => {
            const svcName = normalizeServiceName(service.name);
            return svcName.includes(exactName) || exactName.includes(svcName);
          }) || null;
>>>>>>> origin/main
        }
      }

      const showRecommendation = Boolean(
        !isPureGeneral && aiResponse?.showServiceRecommendation === true && intentCanRecommend && matchedCanonical
      );

      const dbService = showRecommendation && matchedCanonical?._id ? matchedCanonical : null;

      const serviceName = dbService ? dbService.name : (matchedCanonical?.name || aiResponse?.serviceName || 'Home Service');
      const serviceCategory = dbService ? dbService.category : (matchedCanonical?.category || aiResponse?.category || 'Home Repairs');
<<<<<<< HEAD
      const baseCandidatePrice = dbService ? (dbService.basePrice || dbService.price || 350) : (matchedCanonical?.price || aiResponse?.estimatedPrice || 350);

      // Deterministic dynamic pricing calculation (include recent km/params if current turn omits km)
      const hasKmInCurrent = /\d+\s*(?:km|kms|kilometer|kilometres)\b/i.test(text || '');
      const pricingText = hasKmInCurrent ? text : `${text || ''} ${userHistoryText} ${aiResponse?.reply || ''}`;
      const dynamicPricing = computeDynamicChatPrice({
        text: pricingText,
        serviceName,
        category: serviceCategory,
        basePrice: baseCandidatePrice,
        aiEstimatedPrice: aiResponse?.estimatedPrice,
      });

      const servicePrice = dynamicPricing.price;
      const serviceSkill = matchedCanonical?.skill || aiResponse?.requiredWorkerSkill || 'Technician';
      const targetHubRoute = matchedCanonical?.targetHubRoute || null;
      const serviceId = dbService ? dbService._id.toString() : '';
=======
      const catalogMatch = matchedCanonical;

      const CATEGORY_HUB_ROUTES = {
        'Home Repairs': '/customer/general-services/repair-services',
        'Cleaning & Hygiene': '/customer/general-services/cleaning-services',
        'Vehicle Services': '/customer/services/vehicle-services',
        'Events & Celebrations': '/customer/events',
        'Home IT & Tech Support': '/customer/services/home-it',
        'Care & Family': '/customer/services/care-family',
        'Utility & Daily Services': '/customer/general-services',
        'Learning & Support': '/customer/services/learning-support',
        'Property Services': '/customer/services/property-services',
        'Festive & Seasonal': '/customer/services/festive-seasonal',
        'Furniture & Decor': '/customer/services/furniture-decor',
        'Garden & Outdoor': '/customer/services/garden-outdoor',
        'Relocation & Packers': '/customer/relocation',
        'Health & Wellness': '/customer/health-wellness',
        'Kids & Elderly Care': '/customer/services/kids-elderly',
        'Pet Services': '/customer/pet-services',
        'Food & Kitchen': '/customer/food-kitchen',
        'Travel & Commute': '/customer/travel-commute',
        'Society Management': '/customer/society-management',
      };

      const CATEGORY_DEFAULT_SKILLS = {
        'Home Repairs': 'Technician',
        'Cleaning & Hygiene': 'Cleaning Specialist',
        'Vehicle Services': 'Vehicle Mechanic',
        'Events & Celebrations': 'Event Coordinator',
        'Home IT & Tech Support': 'IT Specialist',
        'Care & Family': 'Care Specialist',
        'Utility & Daily Services': 'Service Professional',
        'Learning & Support': 'Tutor / Coach',
        'Property Services': 'Property Specialist',
        'Festive & Seasonal': 'Specialist',
        'Furniture & Decor': 'Furniture Specialist',
        'Garden & Outdoor': 'Gardener',
        'Relocation & Packers': 'Mover & Packer',
        'Health & Wellness': 'Health Professional',
        'Kids & Elderly Care': 'Caregiver',
        'Pet Services': 'Pet Care Specialist',
        'Food & Kitchen': 'Cook / Chef',
        'Travel & Commute': 'Chauffeur / Driver',
        'Society Management': 'Security Specialist',
      };

      const servicePrice = dbService
        ? (dbService.basePrice || dbService.price || 350)
        : (matchedCanonical?.basePrice || matchedCanonical?.price || catalogMatch?.basePrice || aiResponse?.estimatedPrice || 350);
      const serviceSkill = matchedCanonical?.skill || CATEGORY_DEFAULT_SKILLS[serviceCategory] || aiResponse?.requiredWorkerSkill || 'Technician';
      const targetHubRoute = matchedCanonical?.targetHubRoute || CATEGORY_HUB_ROUTES[serviceCategory] || null;
      const serviceId = dbService ? dbService._id.toString() : (catalogMatch?.serviceId || matchedCanonical?.serviceId || '');
>>>>>>> origin/main

      const rawFollowUps = Array.isArray(aiResponse?.followUpQuestions) ? aiResponse.followUpQuestions : [];
      const sanitizedFollowUps = (serviceCategory === 'Travel & Commute' || hasTravelIntent)
        ? (rawFollowUps.some((q) => /pest|party|decoration|cleaning|chef|catering|leakage|plumb/i.test(q)) || rawFollowUps.length === 0
            ? ['With Driver vs Self Drive rate', 'Railway Station / Bus Stand Pick & Drop', 'Sedan / Luxury / Tempo rates']
            : rawFollowUps)
        : rawFollowUps;

      const language = detectLanguage(text);
      let replyMessage = aiResponse?.reply;
      
      if (!replyMessage) {
        if (showRecommendation) {
          replyMessage = language === 'gujarati'
            ? `Samajh gayu. ${serviceName} amara service catalog ma che. Niche details ane booking options joi shako cho.`
            : language === 'hindi'
            ? `Samajh gaya. ${serviceName} hamare service catalog mein listed hai. Neeche details aur booking options dekh sakte hain.`
            : `${serviceName} is listed in our service catalog. You can review the details and booking options below.`;
        } else {
          replyMessage = language === 'gujarati'
            ? 'Tame je kaam mate madad mango cho, eni jaruriyat thodi vadhu detail ma kahi shako?'
            : language === 'hindi'
            ? 'Aap kis kaam ke liye madad chahte hain? Issue ya apni zaroorat thodi detail mein bata sakte hain?'
            : 'What would you like help with? Tell me a little more about the task or issue, and I will help you find the right next step.';
        }
      }

      if (showRecommendation && dynamicPricing.isDynamic && dynamicPricing.explanation) {
        const fareNote = `\n\n📌 **Fair Fare Breakdown**: ${dynamicPricing.explanation} = **₹${servicePrice.toLocaleString('en-IN')}**. Instant booking available below.`;
        if (!replyMessage.includes(`₹${servicePrice}`)) {
          replyMessage += fareNote;
        }
      }

      const payload = {
        status: 'success',
        intent: responseIntent,
        message: replyMessage,
        showServiceRecommendation: showRecommendation,
<<<<<<< HEAD
        followUpQuestions: sanitizedFollowUps.length > 0
          ? sanitizedFollowUps
          : ['Plumbing & Water Leakage', 'Electrical & Wiring Fault', 'AC Repair & Servicing', 'Local House Shifting'],
=======
        followUpQuestions: Array.isArray(aiResponse?.followUpQuestions) && aiResponse.followUpQuestions.length > 0
          ? aiResponse.followUpQuestions
          : (showRecommendation ? [] : []),  // Only suggest service prompts if we actually matched a service
>>>>>>> origin/main
        analysis: showRecommendation ? {
          multimodal: {
            problemAnalysis: {
              problemCategory: serviceCategory,
              confidence: 0.96,
              aiAnalysisRaw: {
                problemType: serviceName,
                urgency: aiResponse?.urgency || 'Standard',
                recommendedActions: aiResponse?.safetyPrecautions || [],
                followUpQuestions: sanitizedFollowUps,
              },
            },
            serviceResolution: {
              resolved: true,
              service: serviceName,
              category: serviceCategory,
              requiredWorkerSkill: serviceSkill,
              priceRangeInr: { min: servicePrice },
              estimatedPrice: servicePrice,
              serviceId,
              targetHubRoute,
              safetyPrecautions: aiResponse?.safetyPrecautions || [],
            },
            recommendation: {
              recommendedService: {
                name: serviceName,
                serviceId,
                category: serviceCategory,
                estimatedPrice: servicePrice,
                priceRangeInr: { min: servicePrice },
                requiredSkill: { primary: serviceSkill },
                safetyPrecautions: aiResponse?.safetyPrecautions || [],
              },
              confidence: { overall: 0.96 },
            },
            summary: {
              topProblem: serviceName,
              resolvedService: serviceName,
              urgencyLevel: aiResponse?.urgency || 'Standard',
            },
          },
        } : null,
      };

      res.status(StatusCodes.OK).json(payload);
    } catch (err) {
      console.error('[customerAi /chat] Critical error:', err);
<<<<<<< HEAD
      const classified = classifyIntent({ text: req.body?.text || '', hasImage: Boolean(req.file) });
=======
      const fallbackLanguage = detectLanguage(req.body?.text || '');
>>>>>>> origin/main
      res.status(StatusCodes.OK).json({
        status: 'success',
        intent: 'CLARIFY',
        message: fallbackLanguage === 'hindi'
          ? 'Maaf kijiye, abhi aapka message process nahi ho paya. Aap apni zaroorat thodi aur detail mein bata sakte hain?'
          : fallbackLanguage === 'gujarati'
          ? 'Maaf karjo, atyare tamaro message process nathi thai shakyo. Tame tamari jaruriyat thodi detail ma samjavi shako?'
          : 'Sorry, I could not process that message just now. Could you tell me a little more about what you need?',
        showServiceRecommendation: false,
        followUpQuestions: [],
        analysis: null,
      });
    }
  })
);

// Dedicated Customer AI Smart Diagnosis endpoint
router.post(
  ['/diagnosis', '/diagnose'],
  optionalAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (req.user && req.user.role && req.user.role !== 'customer') {
      throw new AppError('This AI diagnosis is available only for customers.', StatusCodes.FORBIDDEN);
    }

    const text = String(req.body?.text || req.body?.description || req.body?.notes || '').trim();
    const categoryHint = String(req.body?.category || '').trim();

    let image = null;
    if (req.file) {
      image = {
        base64: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype || 'image/jpeg',
        fileName: req.file.originalname,
        sizeBytes: req.file.size,
      };
      const validation = validateImage(image);
      if (!validation.isValid) {
        throw new AppError(validation.errors[0] || 'Invalid image upload.', StatusCodes.BAD_REQUEST);
      }
    } else if (req.body?.imageUrl) {
      image = {
        base64: String(req.body.imageUrl),
        mimeType: 'image/jpeg',
        fileName: 'remote_image.jpg',
      };
    } else if (req.body?.image && typeof req.body.image === 'string') {
      const raw = req.body.image;
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        image = {
          base64: raw,
          mimeType: 'image/jpeg',
          fileName: 'remote_image.jpg',
        };
      } else {
        const mimeMatch = raw.match(/^data:([^;]+);base64,/);
        const cleanBase64 = raw.replace(/^data:[^;]+;base64,/, '');
        image = {
          base64: cleanBase64,
          mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
          fileName: 'uploaded_image.jpg',
        };
      }
    }

    if (!text && !image) {
      throw new AppError('Please provide a photo or describe the problem to diagnose.', StatusCodes.BAD_REQUEST);
    }

    try {
      await AIProviderManager.initialize();

      const diagnosticPrompt = text
        ? `Customer Problem Description: "${text}". Please perform visual/problem inspection, determine root cause, identify the required tools, recommend safety actions, and identify the exact ServeCircle service needed.`
        : 'Please perform a detailed visual inspection of this image to detect any defects, leaks, electrical faults, damage, or wear and recommend the exact repair service.';

      const aiResponse = await AIProviderManager.chatWithCustomer({
        text: diagnosticPrompt,
        image,
        services: staticCatalog.filter((service) => service.isActive !== false),
        customerContext: { categoryHint },
      });

      let dbService = null;
      const resolvedName = aiResponse.serviceName || 'Home Service';
      if (mongoose.connection.readyState === 1) {
        try {
          dbService = await Service.findOne({
            name: { $regex: new RegExp(resolvedName.trim(), 'i') },
            isActive: true,
          }).lean().catch(() => null);
        } catch {
          dbService = null;
        }
      }

      const serviceName = dbService ? dbService.name : resolvedName;
      const serviceCategory = dbService ? dbService.category : (aiResponse.category || 'Home Repairs');
      const servicePrice = dbService ? (dbService.basePrice || dbService.price || 350) : (aiResponse.estimatedPrice || 350);
      const serviceId = dbService ? dbService._id.toString() : '';
      const confidencePct = '96%';

      const safetyList = Array.isArray(aiResponse.safetyPrecautions) && aiResponse.safetyPrecautions.length > 0
        ? aiResponse.safetyPrecautions
        : [
            'Turn off main power/water supply before technician arrives if safety risk exists.',
            'Keep children and pets away from the affected area.',
            'A verified ServeCircle professional is required to isolate and resolve this issue safely.'
          ];

      const problemType = aiResponse.problemType || `${serviceName} Issue`;
      const issueDetails = aiResponse.reply || `Detected ${problemType} in ${serviceCategory}. Verified professional service is recommended.`;

      const responsePayload = {
        status: 'success',
        intent: 'SERVICE_PROBLEM',
        message: issueDetails,
        showServiceRecommendation: true,
        serviceName,
        serviceCategory,
        estimatedPrice: servicePrice,
        diagnosis: {
          title: problemType,
          category: serviceCategory,
          service: serviceName,
          price: servicePrice,
          severity: aiResponse.urgency || 'Medium',
          aiConfidence: confidencePct,
          confidenceScore: 0.96,
          diagnosisCode: 'SC-AI-' + Math.floor(1000 + Math.random() * 9000),
          issueDetails,
          recommendations: safetyList,
          detectedIssues: [problemType],
          rawMessage: issueDetails,
          serviceId,
          targetHubRoute: null,
        },
        analysis: {
          multimodal: {
            problemAnalysis: {
              problemCategory: serviceCategory,
              confidence: 0.96,
              aiAnalysisRaw: {
                problemType,
                urgency: aiResponse.urgency || 'Medium',
                recommendedActions: safetyList,
                followUpQuestions: aiResponse.followUpQuestions || [],
                reasoningEnglish: issueDetails,
                reasoningLocalized: issueDetails,
              },
            },
            serviceResolution: {
              resolved: true,
              service: serviceName,
              category: serviceCategory,
              requiredWorkerSkill: aiResponse.requiredWorkerSkill || 'Technician',
              priceRangeInr: { min: servicePrice },
              estimatedPrice: servicePrice,
              serviceId,
              safetyPrecautions: safetyList,
            },
            recommendation: {
              recommendedService: {
                name: serviceName,
                category: serviceCategory,
                estimatedPrice: servicePrice,
                priceRangeInr: { min: servicePrice },
                requiredSkill: { primary: aiResponse.requiredWorkerSkill || 'Technician' },
                safetyPrecautions: safetyList,
              },
              confidence: { overall: 0.96 },
            },
            summary: {
              topProblem: problemType,
              urgencyLevel: aiResponse.urgency || 'Medium',
            },
          },
        },
        followUpQuestions: aiResponse.followUpQuestions || [],
      };

      res.status(StatusCodes.OK).json(responsePayload);
    } catch (err) {
      console.error('[customerAi /diagnosis] Error:', err);
      res.status(err.statusCode || StatusCodes.SERVICE_UNAVAILABLE).json({
        status: 'error',
        message: sanitizeError(err),
        retryable: true,
      });
    }
  })
);

export default router;
